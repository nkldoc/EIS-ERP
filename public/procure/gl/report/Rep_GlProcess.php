<?php 
include("../api/List_RepGlProcess.php");
include("../../lib/export/exportUtil.php"); 

$export		= new exportUtil();
 
$s_title	= true;
$title		= CUSTOMER_NAME_TH; 
$caption	= "รายงานประวัติประมวลผลบัญชี";

$c_year0    = $_REQUEST["year"]+542;
$c_year1    = $_REQUEST["year"]+543;

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }
$thead[] = 	"-";
$thead[] = 	"ตุลาคม ".$c_year0;
$thead[] = 	"พฤศจิกายน ".$c_year0;
$thead[] = 	"ธันวาคม ".$c_year0; 
$thead[] = 	"มกราคม ".$c_year1; 
$thead[] = 	"กุมภาพันธ์ ".$c_year1; 
$thead[] = 	"มีนาคม ".$c_year1; 
$thead[] = 	"เมษายน ".$c_year1; 
$thead[] = 	"พฤษภาคม ".$c_year1; 
$thead[] = 	"มิถุนายน ".$c_year1; 
$thead[] = 	"กรกฎาคม ".$c_year1; 
$thead[] = 	"สิงหาคม ".$c_year1; 
$thead[] = 	"กันยายน ".$c_year1; 
$thead[] = 	"กันยายน (ปิดปี) ".$c_year1; 


$arr_months = array("01"=>"มกราคม","02"=>"กุมภาพันธ์","03"=>"มีนาคม","04"=>"เมษายน"
,"05"=>"พฤษภาคม","06"=>"มิถุนายน","07"=>"กรกฎาคม","08"=>"สิงหาคม"
,"09"=>"กันยายน","10"=>"ตุลาคม","11"=>"พฤศจิกายน","12"=>"ธันวาคม");	 
$arr_i_close_year_type = array(GL_CLOSE_YEAR_TYPE_M4=>"ปิดหมวดรายได้",GL_CLOSE_YEAR_TYPE_M5=>"ปิดหมวดค่าใช้จ่าย",GL_CLOSE_YEAR_TYPE_PROFIT=>"โอนกำไร(ขาดทุน)เข้ากำไรยังไม่ได้จัดสรร",GL_CLOSE_YEAR_TYPE_DIVIDENCE=>"ปิดบัญชีเงินปันผล");
  
 


$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {

 
	$arr_mm['01'] = $arr_mm['02'] = $arr_mm['03'] = $arr_mm['04'] = $arr_mm['05'] = $arr_mm['06'] = 'X';
	$arr_mm['07'] = $arr_mm['08'] = $arr_mm['09'] = $arr_mm['10'] = $arr_mm['11'] = $arr_mm['12'] = 'X';
	$arr_mm['13'] = 'X';
	$the_year 	= "";
	$the_month 	= "";
	$tbody		= "<tbody>";
	$tbody		.=	"<tr>";
	$tbody		.= "<td align=\"left\">1.ประมวลผลประจำปี</td>"; 

	 foreach($data_dtl["data"] as $index => $jObj) { 
		$arr_mm[$jObj["c_period"]] 	= "/"; 	
		$the_year					= $jObj["c_yyyy"];	
	 }	 
 	
	$tbody		.= "<td align=\"center\">".$arr_mm['01']."</td><td align=\"center\">".$arr_mm['02']."</td>";
	$tbody		.= "<td align=\"center\">".$arr_mm['03']."</td><td align=\"center\">".$arr_mm['04']."</td>";
	$tbody		.= "<td align=\"center\">".$arr_mm['05']."</td><td align=\"center\">".$arr_mm['06']."</td>"; 
	$tbody		.= "<td align=\"center\">".$arr_mm['07']."</td><td align=\"center\">".$arr_mm['08']."</td>";
	$tbody		.= "<td align=\"center\">".$arr_mm['09']."</td><td align=\"center\">".$arr_mm['10']."</td>";	
	$tbody		.= "<td align=\"center\">".$arr_mm['11']."</td><td align=\"center\">".$arr_mm['12']."</td>";	 	
	$tbody		.= "<td align=\"center\">".$arr_mm['13']."</td>";	 	
	$tbody		.=	"</tr>";
	
 	$str_close_year_details = '';
	$i_cl = 0; $str_data = '';
	$the_year_close = $_REQUEST["year"]+1;
	$sqlClose = "SELECT  distinct c_ref_doc,c_code,c_code_post,c_comment1,i_close_year_type,i_is_post
				FROM gl_tran_hdr
				WHERE
					  i_is_close_year=? and i_enable=?
					and c_yyyy+1=?
					and i_is_post in (?,?)
				ORDER BY i_close_year_type asc";
	$arrParamClose = array (GL_CLOSE_YEAR_PERIOD,STATUS_ENABLE,$the_year_close,BOOK_ACC_GX,BOOK_ACC_GL);
	$stmtClose = $db->QueryParam ( $sqlClose, $arrParamClose ); 
	while ( $f3 = $db->Fetch ( $stmtClose ) )
	{
		$i_cl = 1;
		$c_code_show			= ($f3['i_is_post']==BOOK_ACC_GL) ? $f3['c_code_post'] : $f3['c_code'] ; 
		$str_data 				.= '<tr><td>'.$c_code_show.'</td><td>'.$arr_i_close_year_type[$f3['i_close_year_type']].'</td></tr>';
	}//End Loop	
	$str_close_year_details .= ($i_cl==1) ? '<table border=1><tr><th>เลขที่เอกสาร</th><th>ประเภทการโอน</th></tr>'.$str_data.'</table>' : '';	
	
	
		$tbody	.=	"<tr>";
 		$tbody	.= "<td align=\"left\">2.ปิดบัญชีประจำปี</td>";
		$tbody	.= "<td align=\"center\" colspan=13>".$str_close_year_details."</td>"; 
  		$tbody	.=	"</tr>"; 	
	
	
	
	$tbody		.= "</tbody>";

} 
else 
{ 

 
	$tbody		= "<tbody>";
		$tbody	.=	"<tr>";
		$tbody	.= "<td align=\"left\">1.ประมวลผลประจำปี</td>";
		$tbody	.= "<td align=\"center\">x</td><td align=\"center\">x</td><td align=\"center\">x</td><td align=\"center\">x</td>"; 
		$tbody	.= "<td align=\"center\">x</td><td align=\"center\">x</td><td align=\"center\">x</td><td align=\"center\">x</td>"; 
 		$tbody	.= "<td align=\"center\">x</td><td align=\"center\">x</td><td align=\"center\">x</td><td align=\"center\">x</td>"; 
		$tbody	.= "<td align=\"center\">x</td>";
 		$tbody	.=	"</tr>";
		
		$tbody	.=	"<tr>";
 		$tbody	.= "<td align=\"left\">2.ปิดบัญชีประจำปี</td>";
		$tbody	.= "<td align=\"center\" colspan=13>&nbsp;</td>"; 
  		$tbody	.=	"</tr>"; 		
	$tbody	.= "</tbody>"; 		
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>
<body>
<?php
	if( $s_title == true ) echo "<div align=\"center\"><strong>".$title."</strong></div>"; 
  
	echo "<div align=\"center\"><strong>".$caption."</strong></div>";
	echo "<div align=\"center\"><strong>ปีงบประมาณ : ".($_REQUEST["year"]+543)."</strong></div>";
	
?>
<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
<thead valign="top">
<?php
	echo "<tr>";
	foreach ($thead as $value) {
		echo "<th style='vertical-align:middle;'>".$value."</th>";
	}
	echo "</tr>";
?>
</thead>
<?= $tbody ?>
</table>
</body>
</html>
