<?php
include ("../../conf/config.php");
include ("../../lib/database/DatabaseServer.php");
// ##################
$db = new DatabaseServer ();
$title = "รายงานหมวดภาษีอากร";
// ########################

function strCalTax($i_type_tax)
{
	return ($i_type_tax == 1)? "มาตรา40(1)และ(2)" : "มาตราอื่น";
}

function listDataMethod($dc_section_tax_id) {
	global $db;
	$retData = array();
	
	$sql = "select * from dc_tax_method where dc_section_tax_id = ? order by c_code";
	$stmt = $db->QueryParam ( $sql, array($dc_section_tax_id) );
	
	while ( $fet = $db->Fetch ( $stmt ) )
	{
		$retData[] = $fet;
	}
	return $retData;
}

function listDataSub($dc_section_tax_id) {
	global $db;
	$retData = array();

	$sql = "SELECT a.dc_tax_customer_id
				, a.c_name
				, isnull((select top 1 c_name from dc_tax where dc_tax_id = b.dc_tax_id), 'ยังไม่ได้บันทึกรายการ') as c_tax_name 
				, isnull((select top 1 c_name from dc_tax_income where dc_tax_income_id = b.dc_tax_income_mth_id), '') as c_tax_income_name 
				, isnull((select top 1 c_name from dc_tax_income where parent_id > 0 and parent_id = b.dc_tax_income_mth_id), '') as c_tax_income_parent_name
			FROM dc_tax_customer a
			LEFT JOIN dc_section_tax_sub b ON a.dc_tax_customer_id = b.dc_tax_customer_id 
				AND b.dc_section_tax_id = ?
			order by a.dc_tax_customer_id
				";
	$stmt = $db->QueryParam ( $sql, array($dc_section_tax_id) );

	while ( $fet = $db->Fetch ( $stmt ) )
	{
		$retData[] = $fet;
	}
	return $retData;
}
// //////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////
$str = $_GET ['dc_section_tax_id']; // "Hello world. It's a beautiful day.";
$arr = explode ( ";", $str );
$strData = "";
$titles = "";
$dataMethod = array();
$dataSub = array();

$rowMethod = 0;
$rowSub = 0;
$rowMax = 0;

for($i = 0; $i < sizeof ( $arr ); $i ++) {
	if ($arr [$i] != 0) {
		$getDb = $db->GetDataBySQL ( "select * from dc_section_tax where dc_section_tax_id = ?", array ( $arr [$i] ) );
		//DesignExcelTemplate ( $getDb, $arr [$i] );
		$dataMethod = listDataMethod($arr [$i]);
		$dataSub = listDataSub($arr [$i]);
		
		$rowMethod = count($dataMethod);
		$rowSub = count($dataSub);
		
		if ($rowMethod > $rowSub)
			$rowMax = $rowMethod;
		else 
			$rowMax = $rowSub;
		
		$strDetail = "";
		for($ii=0; $ii < $rowMax; $ii++)
		{
			$dMethod = ($ii < $rowMethod) ? $dataMethod[$ii] : array("c_name"=>"");
			$dSub = ($ii < $rowSub) ? $dataSub[$ii] : array("c_name"=>"","c_tax_name"=>"","c_tax_income_name"=>"","c_tax_income_parent_name"=>"");
			
			$strDetail .= "<tr>"
						. "<td nowrap>".$dMethod["c_name"]."</td>"
						. "<td nowrap>".$dSub["c_name"]."</td>"
						. "<td nowrap>".$dSub["c_tax_name"]."</td>"
						. "<td align='center' nowrap>".$dSub["c_tax_income_name"]."</td>"
						. "<td align='center' nowrap>".$dSub["c_tax_income_parent_name"]."</td>"
						. "</tr>";
		}
		
		$titles = "<div class='text_report_buy'><p>{$title}</p>";
		$titles .= "<p>(รหัส) ชื่อมาตรา : (".$getDb ['c_code'].") ".$getDb["c_name"]."<br />";
		$titles .= "การคำนวณภาษี : " . strCalTax($getDb ['i_type_tax']) . "<br />";
		$titles .= "หมายเหตุ : " . $getDb ['c_comment'] . "</p>";
		
		$strData .= '<table width=100% class="table_report_buy" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">';
		$strData .= '<tr><td align="left" style="font-weight:bold;" colspan="5">' . $titles . '</td></tr>';
		
		$strData .= '<tr bgcolor="#A5BAD6">
						<th width=25% class=top_bottom_small>ประเภทเงินได้
						<th width=25% class=top_bottom_small>ประเภทบุคคล
						<th width=20% class=top_bottom_small>อัตราภาษี
						<th width=15% class=top_bottom_small>ภ.ง.ด. เดือน
						<th width=15% class=top_bottom_small>ภ.ง.ด. ปี
					</tr>';
		$strData .= $strDetail;
		$strData .= '</table></div>';
	}
}

// display
echo "<meta http-equiv='Content-Type' content='text/html; charset=utf-8'>";
if (isset ( $_GET ['act'] ) && $_GET ['act'] == "excel") {
	ob_start ();
	header ( "Content-Type: application/octet-stream" );
	header ( "Content-Transfer-Encoding: binary" );
	header ( 'Expires: ' . gmdate ( 'D, d M Y H:i:s' ) . ' GMT' );
	header ( 'Content-Disposition: attachment; filename = "' . $title . ' ' . date ( "Y-m-d" ) . '.xls"' );
	header ( 'Pragma: no-cache' );
	echo $strData;
	// echo chr(255).chr(254).iconv("UTF-8", "UTF-16LE//IGNORE", $rd);
} else if (isset ( $_GET ['act'] ) && $_GET ['act'] == "html") {
	echo '<style type="text/css">
				.text_report_buy { FONT-SIZE: 14px; COLOR: #00000; FONT-FAMILY: Tahoma}
				.table_report_buy { FONT-SIZE: 12px; COLOR: #00000; FONT-FAMILY: Tahoma}
				.tr_report_buy { FONT-SIZE: 9px; COLOR: #00000; FONT-FAMILY: Tahoma}
		</style>';
	echo $strData;
} else {
	echo '<style type="text/css">
				.text_report_buy { FONT-SIZE: 14px; COLOR: #00000; FONT-FAMILY: Tahoma}
				.table_report_buy { FONT-SIZE: 12px; COLOR: #00000; FONT-FAMILY: Tahoma}
				.tr_report_buy { FONT-SIZE: 9px; COLOR: #00000; FONT-FAMILY: Tahoma}
		</style>';
	echo $strData;
	echo '<script>window.print();</script>';
}

// //////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////
?>

