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
$dc_cost_id = $_REQUEST["dc_cost_id"];
$i_start_month = $_REQUEST["i_start_month"];
$i_start_year = $_REQUEST["i_start_year"];
$i_end_month = $_REQUEST["i_end_month"];
$i_end_year = $_REQUEST["i_end_year"];
$sd_code_start = $_REQUEST["sd_code_start"];
$sd_code_end = $_REQUEST["sd_code_end"];

$ym_start = sprintf("%04d%02d", $i_start_year, $i_start_month);
$ym_end = sprintf("%04d%02d", $i_end_year,$i_end_month);

$arrParam[] = STATUS_ENABLE;
$arrParam[] = substr($ym_start,2, 4);
$arrParam[] = substr($ym_end,2, 4);

$sqlWhere = "";
if ($dc_cost_id > 0)
{
	$sqlWhere .= " and b.dc_cost_id = ?";
	$arrParam[] = $dc_cost_id;
}

if ($sd_code_start != "" && $sd_code_end != ""){
	$sqlWhere .= " and a.c_code between ? and ?";
	$arrParam[] = $sd_code_start;
	$arrParam[] = $sd_code_end;
}else if ($sd_code_start != ""){
	$sqlWhere .= " and a.c_code = ?";
	$arrParam[] = $sd_code_start;
}else if ($sd_code_end != ""){
	$sqlWhere .= " and a.c_code = ?";
	$arrParam[] = $sd_code_end;
}

$sql = "select a.c_code as sd_code
			, c.c_code as asset_code
			, (select c_name from dc_asset_type where c_code = left(c.c_code, 6) and i_enable = 1 and i_delete = 2) as inv_group_name
			, e.c_name as inv_name
			, b.c_name as asset_name
			, d.c_name as cost_name
			, isnull(case when b.i_is_download = 1 then c_asset_code_old else c_serial end,'') as c_asset_code
			, case when isnull(ff.status_bt,0) = 1 then '<font color=#FF0000>ตัดจำหน่าย</font>' else '<font color=#6600FF>ใช้งาน</font>' end status_bt
			, isnull(convert(varchar(10), b.d_register_date, 120),'') as d_register_date
			, isnull(convert(varchar(10), b.d_receive_date, 120),'') as d_receive_date
			, isnull(convert(varchar(10), b.d_depreciate, 120),'') as d_depreciate
			, (select c_name from dc_asset_method where dc_asset_method_id = b.dc_asset_method_id) as method_name
			, b.c_cost_asset
			, b.c_cost_ruins
			, b.i_period_year
			, isnull(c.f_depreciate_cost, b.f_depreciate) as f_depreciate
			, b.c_cost_asset - isnull(c.f_depreciate_cost, b.f_depreciate) as f_acc_cost
			, b.c_comment
			, isnull(convert(varchar(10), b.d_end_warranty, 120),'') as d_end_warranty
		from am_tran_rg_hdr a 
			inner join am_tran_rg_dtl b on a.am_tran_rg_hdr_id=b.am_tran_rg_hdr_id 
			inner join dc_asset c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
			inner join dc_cost d on b.dc_cost_id=d.dc_cost_id
			inner join dc_asset_type e on c.dc_asset_type_id = e.dc_asset_type_id
			left join (select bb.dc_asset_id, 1 as status_bt from am_tf_hdr aa
							inner join am_tf_dtl bb on aa.am_tf_hdr_id = bb.am_tf_hdr_id
						where bb.i_enable='1' 
							and aa.c_code!='0'  
							and aa.c_code_gen !='BT'
							and aa.c_code_gen like 'BT%' 
							and aa.i_enable='1') ff on c.dc_asset_id = ff.dc_asset_id
		where a.i_enable=?
			and case when a.c_code!='none' then substring (a.c_code,3,4) else '0000' end between ? and ?
		{$sqlWhere}
		order by a.c_code, d.c_name, c.c_code ASC";
//echo $sql;
//print_r($arrParam);exit;
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";
$countItemsCode = 0;
$countCode = 0;

$sumCode_cost = 0;
$sumCode_ruins = 0;
$sumCode_depre = 0;
$sumCode_acc = 0;

$sumAll_cost = 0;
$sumAll_ruins = 0;
$sumAll_depre = 0;
$sumAll_acc = 0;

$tempSDCode = "";
while ($row = $db->Fetch($stmt))
{
	if ($tempSDCode != $row["sd_code"])
	{
		if ($sumCode_cost > 0)
		{
			$str .= "<tr bgcolor='#C6D2D1'>"
						."<td align='right' colspan='12'>รวมเลขที่นำเข้าสินทรัพย์: {$tempSDCode}</td>"
						."<td align='right' >".number_format($sumCode_cost,2)."</td>"
						."<td align='right' >".number_format($sumCode_ruins,2)."</td>"
						."<td align='right' >&nbsp;</td>"
						."<td align='right' >".number_format($sumCode_depre,2)."</td>"
						."<td align='right' >".number_format($sumCode_acc,2)."</td>"
						."<td align='left' colspan='2'>&nbsp;</td>"
					."</tr>";
			
			$sumCode_cost = 0;
			$sumCode_ruins = 0;
			$sumCode_depre = 0;
			$sumCode_acc = 0;
		}
		
		$countCode++;
		$str .= "<tr bgcolor='#C6D2D1'>"
					."<td align='left' colspan='19'>{$countCode}. เลขที่นำเข้าสินทรัพย์  : {$row["sd_code"]}</td>"
				."</tr>";
		$tempSDCode = $row["sd_code"];
		
		$countItemsCode = 0;
	}
	
	$countItemsCode++;
	$d_register_date = ($row["d_register_date"] != "")? $date->shot_date_from_db($row["d_register_date"]) : '';
	$d_receive_date = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : '';
	$d_depreciate = ($row["d_depreciate"] != "")? $date->shot_date_from_db($row["d_depreciate"]) : '';
	$d_end_warranty = ($row["d_end_warranty"] != "")? $date->shot_date_from_db($row["d_end_warranty"]) : '';
	
	$str .= "<tr>"
				."<td align='center'>{$countItemsCode}.</td>"
				."<td align='center'>&nbsp;{$row["asset_code"]}</td>"
				."<td align='left'>&nbsp;{$row["inv_group_name"]}</td>"
				."<td align='left'>&nbsp;{$row["inv_name"]}</td>"
				."<td align='left'>&nbsp;{$row["asset_name"]}</td>"
				."<td align='left'>&nbsp;{$row["cost_name"]}</td>"
						
				."<td align='center'>&nbsp;{$row["c_asset_code"]}</td>"
				."<td align='center'>&nbsp;{$row["status_bt"]}</td>"
				."<td align='center'>&nbsp;{$d_register_date}</td>"
				."<td align='center'>&nbsp;{$d_receive_date}</td>"
				."<td align='center'>&nbsp;{$d_depreciate}</td>"
						
				."<td align='left'>{$row["method_name"]}</td>"
				."<td align='right' >".number_format($row["c_cost_asset"],2)."</td>"
				."<td align='right' >".number_format($row["c_cost_ruins"],2)."</td>"
				."<td align='right' >".number_format($row["i_period_year"],2)."</td>"
				."<td align='right' >".number_format($row["f_depreciate"],2)."</td>"
						
				."<td align='right' >".number_format($row["f_acc_cost"],2)."</td>"
				."<td align='left'>{$row["c_comment"]}</td>"
				."<td align='center'>&nbsp;{$d_end_warranty}</td>"
			."</tr>";
	
	$sumCode_cost += $row["c_cost_asset"];
	$sumCode_ruins += $row["c_cost_ruins"];
	$sumCode_depre += $row["f_depreciate"];
	$sumCode_acc += $row["f_acc_cost"];
	
	$sumAll_cost += $row["c_cost_asset"];
	$sumAll_ruins += $row["c_cost_ruins"];
	$sumAll_depre += $row["f_depreciate"];
	$sumAll_acc += $row["f_acc_cost"];
}// end while
if ($sumCode_cost > 0)
{
	$str .= "<tr bgcolor='#C6D2D1'>"
				."<td align='right' colspan='12'>รวมเลขที่นำเข้าสินทรัพย์: {$tempSDCode}</td>"
				."<td align='right' >".number_format($sumCode_cost,2)."</td>"
				."<td align='right' >".number_format($sumCode_ruins,2)."</td>"
				."<td align='right' >&nbsp;</td>"
				."<td align='right' >".number_format($sumCode_depre,2)."</td>"
				."<td align='right' >".number_format($sumCode_acc,2)."</td>"
				."<td align='left' colspan='2'>&nbsp;</td>"
			."</tr>";
}

if ($sumAll_cost > 0)
{
	$str .= "<tr bgcolor='#E2E8E9'>"
				."<td align='right' colspan='12'>รวมทั้งหมด</td>"
				."<td align='right' >".number_format($sumAll_cost,2)."</td>"
				."<td align='right' >".number_format($sumAll_ruins,2)."</td>"
				."<td align='right' >&nbsp;</td>"
				."<td align='right' >".number_format($sumAll_depre,2)."</td>"
				."<td align='right' >".number_format($sumAll_acc,2)."</td>"
				."<td align='left' colspan='2'>&nbsp;</td>"
			."</tr>";
}

$str .= "</table>";

//-------------------------------------
if ($sd_code_start != "" && $sd_code_end != "")
	$strCode = $sd_code_start." ถึง ".$sd_code_end;
else 
	$strCode = "ทั้งหมด";

$cost_name = ($dc_cost_id > 0) ? $db->GetDataBySQL("select c_name from dc_cost where dc_cost_id = ?", array($dc_cost_id)) : "ทุกหน่วยงาน";


$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="19">'.$_REQUEST["titleReport"].'</th></tr>
			<tr><th colspan="19">เลขที่นำเข้าสินทรัพย์   : '.$strCode.'</th></tr>
			<tr><th colspan="19">หน่วยงานที่ใช้สินทรัพย์  : '.$cost_name.'</th></tr>
		</table>
		<table cellspacing="0" cellpadding="0" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr bgcolor="#A5BAD6">
				<th align="center"><b>ลำดับที่</b></th>
				<th align="center"><b>รหัสสินทรัพย์</b></th>
				<th align="center"><b>หมวดสินทรัพย์</b></th>
				<th align="center"><b>รายการสินทรัพย์</b></th>
				<th align="center"><b>ชื่อสินทรัพย์</b></th>
				<th align="center"><b>ใช้ที่หน่วยงาน</b></th>
				<th align="center"><b>หมายเลขสินทรัพย์</b></th>
				<th align="center"><b>สถานะ</b></th>
				<th align="center"><b>วันที่ขึ้นทะเบียน</b></th>
				<th align="center"><b>วันที่ได้มา</b></th>
				<th align="center"><b>วันที่เริ่มต้นคิดค่าเสื่อมราคา</b></th>
				<th align="center"><b>วิธีการได้มา</b></th>
				<th align="center"><b>ราคาทุน </b></th>
				<th align="center"><b>มูลค่าซาก</b></th>
				<th align="center"><b>อายุการใช้งาน (ปี)</b></th>
				<th align="center"><b>ค่าเสื่อมราคาสะสม</b></th>
				<th align="center"><b>ราคาตามบัญชี</b></th>
				<th align="center"><b>หมายเหตุ</b></th>
				<th align="center"><b>วันที่หมดประกัน</b></th>
			</tr>
'.$str;

if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str); 			
?>