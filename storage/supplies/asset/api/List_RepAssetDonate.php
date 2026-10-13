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

	// $con = ' AND a.i_budget_year = '.($_REQUEST['i_year'] + 543);

	// if ($_REQUEST['dc_expense_budget_type_id'] > '0') {
	// 	$con .= ' AND a.dc_expense_budget_type_id = ' . $_REQUEST['dc_expense_budget_type_id'];
	// }
	// if ($_REQUEST['am_mode_id'] > '0') {
	// 	$con .= ' AND a.am_mode_id = ' . $_REQUEST['am_mode_id'];
	// }
	// if ($_REQUEST['i_qualify'] > '0') {
	// 	$con .= ' AND isnull(a.i_cal,0) = ' . ($_REQUEST['i_qualify'] == 2 ? '0' : '1');
	// }
$i_year = $_REQUEST['i_year'] ;
$i_month = $_REQUEST['i_month'] ;
$i_qualify = $_REQUEST['i_qualify'] ;
$mm_start = $_REQUEST['mm_start'] ;
$yyyy_start = $_REQUEST['yyyy_start'] ;
$mm_end = $_REQUEST['mm_end'] ;
$yyyy_end = $_REQUEST['yyyy_end'] ;

$c_yyyy_mm = sprintf("%04d%02d",$i_year,$i_month);
$c_yyyy_mm_start = sprintf("%04d%02d",$yyyy_start,$mm_start);
$c_yyyy_mm_end = sprintf("%04d%02d",$yyyy_end,$mm_end);
		if ($i_qualify ==1){
			$con =" between '{$c_yyyy_mm_start}'and '{$c_yyyy_mm_end}' ";
		} else {
			$con =" <= '{$c_yyyy_mm_start}' ";
		}
		


	$sqlMain = "
	SET NOCOUNT ON
	DECLARE @c_yyyy_mm AS VARCHAR(6) = '{$c_yyyy_mm}';
  
	/*หายอดยกมา*/
	SELECT a.am_asset_hdr_id
	, CASE WHEN b.max_ym = @c_yyyy_mm THEN a.f_depre_begin ELSE a.f_depre_after END AS f_depre_after
	INTO #temp_begin
	FROM am_tran_depre a
	INNER JOIN
	(SELECT 
	am_asset_hdr_id, MAX(c_yyyy_mm) AS max_ym
	FROM am_tran_depre WHERE c_yyyy_mm <= @c_yyyy_mm
	GROUP BY am_asset_hdr_id) b ON a.am_asset_hdr_id = b.am_asset_hdr_id AND a.c_yyyy_mm = b.max_ym;
  
	/*ค่าเสื่อมแต่หละเดือน*/
	SELECT am_asset_hdr_id
	 , SUM(f_depre) AS f_depre
	INTO #temp_depre
	FROM am_tran_depre td
	WHERE c_yyyy_mm = @c_yyyy_mm
	GROUP BY am_asset_hdr_id;
  
   SELECT 
	  case when a.i_donate = 1 then 'สินทรัพย์บริจาค'
	  else''
	  end as i_donate
	 ,a.imp_id
	 ,a.c_code
	 ,a.c_name
	 ,b.c_code +' : '+ b.c_name as am_mode_name
	 ,a.acc_code + ' : ' + a.acc_name as acc_name
	 ,(SELECT c_name FROM NMU..dc_expense_budget_type aa WHERE aa.dc_expense_budget_type_id = a.dc_expense_budget_type_id) AS budget_source
	 ,a.i_period_year
	 ,convert(varchar,a.d_receive_date,120) as d_receive_date
	 , a.f_unit_cost AS f_unit_cost
	 ,case when a.i_cal = 1 then a.f_unit_cost else 0 end as i_cal
	 ,case when a.i_cal = 0 then a.f_unit_cost else 0 end as i_nocal
	 , ISNULL(ISNULL(tb.f_depre_after, a.f_depre_begin),0.00) AS f_depre_begin
	 , td.f_depre AS f_depre
	FROM am_asset_hdr a
	INNER JOIN am_mode_acc b ON a.am_mode_id = b.am_mode_id
	LEFT JOIN #temp_begin tb ON a.am_asset_hdr_id = tb.am_asset_hdr_id
	LEFT JOIN #temp_depre td ON a.am_asset_hdr_id = td.am_asset_hdr_id 
	WHERE 
	/*ยังขาดการกรองตัดจำหน่าย ยังไม่มี process*/
	 CAST(YEAR(a.d_receive_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(a.d_receive_date) AS VARCHAR(2)) , 2) {$con}
	 AND a.i_donate = 1
   ORDER BY b.c_code,a.c_code;
   drop table #temp_begin;
   drop table #temp_depre;
  
  
  
  
	";
	$stmt = $db->QueryParam($sqlMain, array());

	if ($_REQUEST["type"] != "excel2007") {
		if ($stmt) {
			
			while ($row = $db->Fetch($stmt)) {
				$f_lift = ($row["f_depre_begin"]-0)+($row["f_depre"]-0);
				$temp = array(
					"c_code"            =>	$row["c_code"],
					"c_name"            =>	$row["c_name"],
					"am_mode_name"		=>  $row["am_mode_name"],
					"acc_name"		    =>  $row["acc_name"],
					"budget_source"     =>	$row["budget_source"],
					"i_period_year"     =>	$row["i_period_year"],
					"d_receive_date"    => ($row["d_receive_date"] != "") ? $date->shot_date_from_db($row["d_receive_date"]) : "",
					"f_unit_cost"     	=>	$row["f_unit_cost"]  == '' ? '0.00' : $row["f_unit_cost"],
					"i_cal"      		=>	$row["i_cal"],
					"i_nocal"      		=>	$row["i_nocal"],
					"f_depre_begin"     =>	$row["f_depre_begin"] == '' ? '0.00' : $row["f_depre_begin"],
					"f_depre"           =>	$row["f_depre"] == '' ? '0.00' : $row["f_depre"],
					"f_lift"            =>	$f_lift,
					"i_donate"          =>	$row["i_donate"] ,

				);
				${$root}[]	= $temp;
			}
		}
		return json_encode(array("debug" => true,  $root => ${$root}));
		//echo json_encode(array("debug" => true,  $root => ${$root})); exit ;
	} else {
		if ($stmt) {
			$columns[] = "รหัสครุภัณฑ์";
			$columns[] = "ชื่อครุภัณฑ์";
			$columns[] = "รหัส/ชื่อ หมวดพัสดุ";
			$columns[] = "รหัส/ชื่อ บัญชี";
			$columns[] = "แหล่งเงิน";
			$columns[] = "อายุการใช้งาน";
			$columns[] = "วันที่ได้รับ";
			$columns[] = "มูลค่าที่ได้รับ";
			$columns[] = "มูลค่าเข้าเกณฑ์";
			$columns[] = "มูลค่าต่ำกว่าเกณฑ์";
			$columns[] = "ค่าเสื่อมสะสมยกมา";
			$columns[] = "ค่าเสื่อมประจำเดือน";
			$columns[] = "ค่าเสื่อมยกไป";
			$columns[] = "สินทรัพย์บริจาค";
			
			
			${$root}[] = $columns;
			
			$f_unit_cost = 0;
			$f_depre_begin = 0;
			$f_mm_sum = 0;
			
			while ($row = $db->Fetch($stmt)) {
				$temp = array(
					"c_code"            =>	$row["c_code"],
					"c_name"            =>	$row["c_name"],
					"am_mode_name"		=>  $row["am_mode_name"],
					"acc_name"		    =>  $row["acc_name"],
					"budget_source"     =>	$row["budget_source"],
					"i_period_year"     =>	$row["i_period_year"],
					"d_receive_date"    => ($row["d_receive_date"] != "") ? $date->shot_date_from_db($row["d_receive_date"]) : "",
					"f_unit_cost"     	=>	$row["f_unit_cost"]  == '' ? '0.00' : $row["f_unit_cost"],
					"i_cal"      		=>	$row["i_cal"],
					"i_nocal"      		=>	$row["i_nocal"],
					"f_depre_begin"     =>	$row["f_depre_begin"] == '' ? '0.00' : $row["f_depre_begin"],
					"f_depre"           =>	$row["f_depre"] == '' ? '0.00' : $row["f_depre"],
					"f_lift"            =>	($row["f_depre_begin"]-0)+($row["f_depre"]-0),
					"i_donate"          =>	$row["i_donate"] ,

				);
				${$root}[]	= $temp;
			}
			
		}
		$xlsx = new ArrToXlsx();
		$xlsx->ArrToXlsx(${$root}, "รายงานตรวจสอบครุภัณฑ์ประจำปี");
	}
}
