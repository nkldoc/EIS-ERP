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
//print_r($_REQUEST);exit;
//iSearch
$asset_group = $_REQUEST["asset_group"];
$asset_type = $_REQUEST["asset_type"];
$dc_asset_id = $_REQUEST["dc_asset_id"];

$arrParam[] = $dc_asset_id;
$sql = "select isnull(convert(varchar(10),d_doc_date,120), '') as d_doc_date
            , isnull(f_depreciate_af, 0.00) as f_depreciate_af
            , isnull(f_depre, 0.00) as f_depre
            , isnull(f_salv, 0.00) as f_salv
            , isnull(acc_depre_cost, 0.00) as acc_depre_cost
        from gl_asset_depre
        where dc_asset_id = ?
        order by c_yyyy_mm";
//print_r($arrParam);
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";
while ($row = $db->Fetch($stmt))
{
	$d_doc_date = ($row["d_doc_date"] != "")? $date->shot_date_from_db($row["d_doc_date"]) : '';
	
	$str .= "<tr>"
                    ."<td align='center'>&nbsp;{$d_doc_date}</td>"
                    ."<td align='right' >".number_format($row["f_depreciate_af"],2)."</td>"
                    ."<td align='right' >".number_format($row["f_depre"],2)."</td>"
                    ."<td align='right' >".number_format($row["f_salv"],2)."</td>"
                    ."<td align='right' >".number_format($row["acc_depre_cost"],2)."</td>"
            ."</tr>";
}// end while
$str .= "</table>";

//-------------------------------------
$invGroupName = ($asset_group != "") ? $db->GetDataBySQL("select c_code+' '+c_name from dc_asset_type where c_code = ?", array($asset_group)) : "ไม่ระบุ";
$invTypeName = ($asset_type != "") ? $db->GetDataBySQL("select c_code+' '+c_name from dc_asset_type where c_code = ?", array($asset_type)) : "ไม่ระบุ";

$sql ="select b.c_code+' '+b.c_name as inv_name
            , (select c_code+' '+c_name from dc_cost where dc_cost_id = a.dc_cost_id) as cost_name1
            , case when dc_cost_id_ta is null then '' else (select c_code+' '+c_name from dc_cost where dc_cost_id = a.dc_cost_id_ta) end as cost_name2
            , a.c_code+' '+c.c_name as dc_asset_name
            , a.f_unit_cost, a.c_cost_ruins, a.i_period_year
            , isnull(convert(varchar(10),c.d_receive_date,120),'') as d_receive_date
            , (select c_name from dc_asset_method where dc_asset_method_id = c.dc_asset_method_id) as method_name
            , isnull(convert(varchar(10),c.d_depreciate,120),'') as d_depreciate
            , case a.i_enable when 1 then '<font color=blue><b>ใช้งาน</b></font>' else '<font color=red><b>ตัดจำหน่าย/ยกเลิกคำนวณค่าเสื่อมราคา</b></font>' end str_enable
        from dc_asset a
            inner join dc_asset_type b on a.dc_asset_type_id = b.dc_asset_type_id
            inner join am_tran_rg_dtl c on a.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
        where a.dc_asset_id = ?";
$dataGet = $db->GetDataBySQL($sql, array($dc_asset_id));
$d_receive = ($dataGet["d_receive_date"] != "")? $date->shot_date_from_db($dataGet["d_receive_date"]) : '-';
$d_depreciate = ($dataGet["d_depreciate"] != "")? $date->shot_date_from_db($dataGet["d_depreciate"]) : '';

$cost_name2 = ($dataGet["cost_name2"] != "") ? $dataGet["cost_name2"] : $dataGet["cost_name1"];
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="5">'.$_REQUEST["titleReport"].'</th></tr>
			<tr><td colspan="5" align="left"><b>หมวดสินทรัพย์   :</b> '.$invGroupName.'</td></tr>
			<tr><td colspan="5" align="left"><b>ประเภทสินทรัพย์  :</b> '.$invTypeName.'</td></tr>
                            
                        <tr><td colspan="5" align="left" style="color:blue"><b>หน่วยงานที่ขึ้นทะเบียน :</b> '.$dataGet["cost_name1"].'</td></tr>
                        <tr><td colspan="5" align="left" style="color:blue"><b>หน่วยงานปัจจุบัน  :</b> '.$cost_name2.'</td></tr>
                        <tr><td colspan="5" align="left"><b>รายการสินทรัพย์ :</b> '.$dataGet["inv_name"].'</td></tr>
                        <tr><td colspan="5" align="left"><b>รหัส/ชื่อสินทรัพย์  :</b> '.$dataGet["dc_asset_name"].'</td></tr>
                        <tr><td colspan="5" align="left"><b>ราคาทุน :</b> '.number_format($dataGet["f_unit_cost"],2).' <b>บาท</b> &nbsp;&nbsp;&nbsp;&nbsp; <b>มูลค่าซาก :</b> '.number_format($dataGet["c_cost_ruins"],2).' <b>บาท</b> &nbsp;&nbsp;&nbsp;&nbsp; <b>อายุการใช้งาน :</b> '.number_format($dataGet["i_period_year"],2).' <b>ปี</b> </td></tr>
                        <tr><td colspan="5" align="left"><b>วันที่ได้มา :</b> '.$d_receive.' &nbsp;&nbsp;&nbsp;&nbsp; <b>วิธีการได้มา :</b> '.$dataGet["method_name"].'</td></tr>
                        <tr><td colspan="5" align="left"><b>วันที่เริ่มต้นคำนวณค่าเสื่อมราคา :</b> '.$d_depreciate.'</td></tr>
                        <tr><td colspan="5" align="left"><b>สถานะการใช้งาน :</b> '.$dataGet["str_enable"].'</td></tr>
		</table>
		<table cellspacing="0" cellpadding="0" width="100%" border="1" style="border-collapse:collapse; border:none; mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr bgcolor="#A5BAD6">
                            <th align="center"><b>วันที่คำนวณค่าเสื่อม</b></th>
                            <th align="center"><b>ค่าเสื่อมราคาสะสมยกมา (บาท)</b></th>
                            <th align="center"><b>ค่าเสื่อมราคาประจำเดือน (บาท)</b></th>
                            <th align="center"><b>ค่าเสื่อมราคาสะสมยกไป (บาท)</b></th>
                            <th align="center"><b>ราคาตามบัญชี (บาท)</b></th>
			</tr>
'.$str;

if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str); 			
?>