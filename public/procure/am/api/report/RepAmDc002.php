<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../conf/config_am.php");
include("../../../lib/date/i_date.class.php");

	
function headerX($t='',$rd){
		 
	$title= $_REQUEST['titleReport'];
	$tt = isset($t) && $t!=''?true:false;
	switch($t)
	{ 
		case 'excel': $ttt = 'xls'; break; 
		case 'downloadHTML': $ttt = 'html'; break;  
		case 'html': $ttt 	= ''; break;
		default: $ttt='';
	} 
	if($ttt!=''){ //file include is not spacing outer tag php
		header("Content-Type: application/octet-stream");
		header("Content-Transfer-Encoding: binary");
		header('Expires: '.gmdate('D, d M Y H:i:s').' GMT');
		header('Content-Disposition: attachment; filename = "'.$title.' '.date("Y-m-d-H-i-s").'.'.$ttt.'"');
		header('Pragma: no-cache'); 
		echo chr(255).chr(254).iconv("UTF-8", "UTF-16LE//IGNORE", $rd);  
	}else{
		header('Content-Type: text/html; charset=utf-8');
		echo '<style type="text/css"> body{ padding:0px; margin:0px; } #footer td{ background-color:#fff;} </style>';
		echo $rd;
	}   
}; //Function
 
###################
$db 	= new DatabaseServer();
$date 	= new i_date();
########################################################################## 
	
//iSearch
$arr_status = array(0=>"ทั้งหมด", STATUS_ENABLE=>"<font color='blue'>ใช้งาน</font>", STATUS_DISABLE=>"<font color='red'>ไม่ใช้งาน</font>");

$sql = "SELECT c_code, c_name, c_comment, i_enable
		FROM dc_asset_method  
		WHERE i_delete = ?
		ORDER BY i_enable DESC,c_code ASC";
$stmt = $db->QueryParam($sql, array(DELETE_FALSE));
$str ="";
$i = 1;

while ($row = $db->Fetch($stmt))
{
	$strStatus = ($row["i_enable"] == STATUS_ENABLE)? "<font color='blue'>ใช้งาน</font>" : "<font color='blue'>ไม่ใช้งาน</font>";
	$str .= "<tr>"
				."<td align='center'>{$i}.</td>"
				."<td align='center'>&nbsp;{$row["c_code"]}</td>"
				."<td align='left'>{$row["c_name"]}</td>"
				."<td align='center'>{$row["c_comment"]}</td>"
				."<td align='center' >{$strStatus}</td>"
			."</tr>";

	$i++;

}// end while
$str .= "</table>";

//-------------------------------------
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="5">รายงานข้อมูลการได้มาของสินทรัพย์</th></tr>
		</table>
		<table cellspacing="0" cellpadding="0" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr bgcolor="#A5BAD6">
				<th align="center"><b>ลำดับ</b></th>
				<th align="center"><b>รหัส</b></th>
				<th align="center"><b>การได้มาของสินทรัพย์</b></th>
				<th align="center"><b>หมายเหตุ</b></th>
				<th align="center"><b>สถานะ</b></th>
			</tr>
'.$str;
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str); 			
?>