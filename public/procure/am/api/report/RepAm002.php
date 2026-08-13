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
$cost_code1 = $_REQUEST["cost_code1"];
$cost_code2 = $_REQUEST["cost_code2"];
$dc_asset_method_id = $_REQUEST["dc_asset_method_id"];

$arrParam[] = ASSET_STATUS_WAIT;
$arrParam[] = $asset_type."%";

$sqlWhere = "";
if ($dc_asset_method_id > 0)
{
    $sqlWhere .= " and b.dc_asset_method_id = ?";
    $arrParam[] = $dc_asset_method_id;
}

if ($cost_code1 != "" && $cost_code2 != ""){
    $sqlWhere .= " and c.c_code between ? and ?";
    $arrParam[] = $cost_code1;
    $arrParam[] = $cost_code2;
}else if ($cost_code1 != ""){
    $sqlWhere .= " and c.c_code = ?";
    $arrParam[] = $cost_code1;
}else if ($cost_code2 != ""){
    $sqlWhere .= " and c.c_code = ?";
    $arrParam[] = $cost_code2;
}

$sql = "SELECT c.c_code as cost_code
                    , c.c_name as cost_name
                    , a.c_code as sd_code
                    , b.c_code as asset_code
                    , b.c_name
                    , b.c_asset_code_old
                    , case when b.i_is_expense = 1 then 'ไม่คำนวณค่าเสื่อมราคา' else 'คำนวณค่าเสื่อมราคา' end i_is_expense
                    , isnull(convert(varchar(10), b.d_register_date, 120),'') as d_register_date
                    , isnull(convert(varchar(10), b.d_receive_date, 120),'') as d_receive_date
                    , isnull(convert(varchar(10), b.d_depreciate, 120),'') as d_depreciate
                    , (select c_name from dc_asset_method where dc_asset_method_id = b.dc_asset_method_id) as method_name
                    , b.c_cost_asset
                    , b.c_cost_ruins
                    , b.i_period_year
                    , b.f_depreciate
                    , b.c_comment
                    , b.c_doc_imp
                    , isnull(convert(varchar(10), b.d_doc_imp, 120),'') as d_doc_imp
		FROM am_tran_rg_hdr a 
                    INNER JOIN am_tran_rg_dtl b ON a.am_tran_rg_hdr_id = b.am_tran_rg_hdr_id
                    INNER JOIN dc_cost c on b.dc_cost_id = c.dc_cost_id
		WHERE a.c_code like 'SD%' and a.c_code != 'SD'
			and isnull(a.i_is_success,0) = ?
			and b.c_code like ?
			{$sqlWhere}
		ORDER BY c.c_code, a.c_code,b.c_code";
//print_r($arrParam);
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";
$countItemsAll = 0;
$countItemsCost = 0;
$countCost = 0;

$sumCost_cost = 0;
$sumCost_ruins = 0;
$sumCost_depre = 0;

$sumAll_cost = 0;
$sumAll_ruins = 0;
$sumAll_depre = 0;
$tempCostCode = "";
$tempCostName = "";
while ($row = $db->Fetch($stmt))
{
	if ($tempCostCode != $row["cost_code"])
	{
		if ($sumCost_cost > 0)
		{
                    $str .= "<tr bgcolor='#C6D2D1'>"
                                ."<td align='right' colspan='10'>รวมหน่วยงาน : {$tempCostCode} {$tempCostName}</td>"
                                ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
                                ."<td align='right' >".number_format($sumCost_ruins,2)."</td>"
                                ."<td align='right' >&nbsp;</td>"
                                ."<td align='right' >".number_format($sumCost_depre,2)."</td>"
                                ."<td align='left' colspan='3'>&nbsp;</td>"
                            ."</tr>";

                    $sumCost_cost = 0;
                    $sumCost_ruins = 0;
                    $sumCost_depre = 0;
		}
		
		$str .= "<tr bgcolor='#C6D2D1'>"
                            ."<td align='left' colspan='17'>หน่วยงาน : {$row["cost_code"]} {$row["cost_name"]}</td>"
                        ."</tr>";
		$tempCostCode = $row["cost_code"];
		$tempCostName = $row["cost_name"];
		$countCost++;
		$countItemsCost = 0;
	}
	
	$countItemsCost++;
	$c_name = wordwrap($row["c_name"],50,'<br />', true);
	$d_register_date = ($row["d_register_date"] != "")? $date->shot_date_from_db($row["d_register_date"]) : '';
	$d_receive_date = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : '';
	$d_depreciate = ($row["d_depreciate"] != "")? $date->shot_date_from_db($row["d_depreciate"]) : '';
	$d_doc_imp = ($row["d_doc_imp"] != "")? $date->shot_date_from_db($row["d_doc_imp"]) : '';
	$str .= "<tr>"
				."<td align='center'>{$countItemsCost}.</td>"
				."<td align='center'>&nbsp;{$row["sd_code"]}</td>"
				."<td align='center'>&nbsp;{$row["asset_code"]}</td>"
				."<td align='left'>&nbsp;{$row["c_name"]}</td>"
				."<td align='left'>&nbsp;{$row["c_asset_code_old"]}</td>"
				."<td align='center'>&nbsp;{$row["i_is_expense"]}</td>"
				."<td align='center'>&nbsp;{$d_register_date}</td>"
				."<td align='center'>&nbsp;{$d_receive_date}</td>"
				."<td align='center'>&nbsp;{$d_depreciate}</td>"
				."<td align='left'>{$row["method_name"]}</td>"
				."<td align='right' >".number_format($row["c_cost_asset"],2)."</td>"
				."<td align='right' >".number_format($row["c_cost_ruins"],2)."</td>"
				."<td align='right' >".number_format($row["i_period_year"],2)."</td>"
				."<td align='right' >".number_format($row["f_depreciate"],2)."</td>"
				."<td align='left'>{$row["c_comment"]}</td>"
				."<td align='left'>{$row["c_doc_imp"]}</td>"
				."<td align='center'>&nbsp;{$d_doc_imp}</td>"
			."</tr>";
	
	$sumCost_cost += $row["c_cost_asset"];
	$sumCost_ruins += $row["c_cost_ruins"];
	$sumCost_depre += $row["f_depreciate"];
	
	$sumAll_cost += $row["c_cost_asset"];
	$sumAll_ruins += $row["c_cost_ruins"];
	$sumAll_depre += $row["f_depreciate"];
	
	$countItemsAll++;
}// end while
if ($sumCost_cost > 0)
{
	$str .= "<tr bgcolor='#C6D2D1'>"
				."<td align='right' colspan='10'>รวมหน่วยงาน : {$tempCostCode} {$tempCostName}</td>"
				."<td align='right' >".number_format($sumCost_cost,2)."</td>"
				."<td align='right' >".number_format($sumCost_ruins,2)."</td>"
				."<td align='right' >&nbsp;</td>"
				."<td align='right' >".number_format($sumCost_depre,2)."</td>"
				."<td align='left' colspan='3'>&nbsp;</td>"
			."</tr>";
}

if ($sumAll_cost > 0)
{
	$str .= "<tr bgcolor='#E2E8E9'>"
				."<td align='right' colspan='10'>รวมทั้งหมด</td>"
				."<td align='right' >".number_format($sumAll_cost,2)."</td>"
				."<td align='right' >".number_format($sumAll_ruins,2)."</td>"
				."<td align='right' >&nbsp;</td>"
				."<td align='right' >".number_format($sumAll_depre,2)."</td>"
				."<td align='left' colspan='3'>&nbsp;</td>"
			."</tr>";
}

$str .= "<tr bgcolor='#E2E8E9'>"
			."<td align='left' colspan='17'>สินทรัพย์ทั้งหมด ".number_format($countItemsAll,2)." รายการ</td>"
		."</tr>"
		."<tr bgcolor='#E2E8E9'>"
			."<td align='left' colspan='17'>หน่วยงานทั้งหมด {$countCost} หน่วยงาน </td>"
		."</tr>"
	."</table>";

//-------------------------------------
$group = $db->GetDataBySQL("select c_code+' '+c_name from dc_asset_type where c_code = ?", array($asset_group));
$type = $db->GetDataBySQL("select c_code+' '+c_name from dc_asset_type where c_code = ?", array($asset_type)); 
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="17">'.$_REQUEST["titleReport"].'</th></tr>
			<tr><th colspan="17">หมวดสินทรัพย์  : '.$group.'</th></tr>
			<tr><th colspan="17">ประเภทสินทรัพย์  : '.$type.'</th></tr>
		</table>
		<table cellspacing="0" cellpadding="0" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr bgcolor="#A5BAD6">
				<th align="center"><b>ลำดับที่</b></th>
				<th align="center"><b>เลขที่นำเข้าสินทรัพย์</b></th>
				<th align="center"><b>รหัสสินทรัพย์</b></th>
				<th align="center"><b>รายการสินทรัพย์</b></th>
				<th align="center"><b>หมายเลขสินทรัพย์</b></th>
				<th align="center"><b>ค่าใช้จ่ายทางบัญชี</b></th>
				<th align="center"><b>วันที่ขึ้นทะเบียน</b></th>
				<th align="center"><b>วันที่ได้มา</b></th>
				<th align="center"><b>วันที่เริ่มต้นคิดค่าเสื่อมราคา</b></th>
				<th align="center"><b>วิธีการได้มา</b></th>
				<th align="center"><b>ราคาทุน </b></th>
				<th align="center"><b>มูลค่าซาก</b></th>
				<th align="center"><b>อายุการใช้งาน (ปี)</b></th>
				<th align="center"><b>ค่าเสื่อมราคาสะสม</b></th>
				<th align="center"><b>หมายเหตุ</b></th>
				<th align="center"><b>เลขที่ใบสำคัญ</b></th>
				<th align="center"><b>วันที่ใบสำคัญ</b></th>
			</tr>
'.$str;
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str); 			
?>