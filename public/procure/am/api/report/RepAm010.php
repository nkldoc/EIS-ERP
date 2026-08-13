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
$cost_code1 = $_REQUEST["cost_code1"];
$cost_code2 = $_REQUEST["cost_code2"];
$i_start_month = $_REQUEST["i_start_month"];
$i_start_year = $_REQUEST["i_start_year"];
$i_end_month = $_REQUEST["i_end_month"];
$i_end_year = $_REQUEST["i_end_year"];

$ym_start = sprintf("%04d%02d", $i_start_year, $i_start_month);
$ym_end = sprintf("%04d%02d", $i_end_year,$i_end_month);

$arrParam[] = $ym_start;
$arrParam[] = $ym_end;

$sqlWhere = "";

if ($asset_group != "")
{
    $sqlWhere .= " and a.c_code like ?";
    $arrParam[] = "{$asset_group}%";
}
if ($cost_code1 != "" && $cost_code2 != "")
{
	$sqlWhere .= " and b.c_code between ? and ?";
	$arrParam[] = $cost_code1;
        $arrParam[] = $cost_code2;
}

$sql = "select left(a.c_code, 4) as asset_code
            , c.c_name as asset_name
            , b.c_code as cost_code
            , b.c_name as cost_name
            , sum(a.f_depre) as f_depreciate
        from gl_asset_depre a 
            inner join dc_cost b on a.dc_cost_id = b.dc_cost_id
            inner join dc_asset_type c on left(a.c_code, 4) = c.c_code
        where a.c_yyyy_mm between ? and ?
        {$sqlWhere}
        group by left(a.c_code, 4), b.c_code, b.c_name, c.c_name
        order by cost_code, asset_code";
//print_r($arrParam);
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";

$sumCost = 0;
$sumAll = 0;

$tempCostCode = "";
$tempCostName = "";
$strCostName = "";
while ($row = $db->Fetch($stmt))
{
	if ($tempCostCode != $row["cost_code"])
	{
            if ($sumCost > 0)
            {
                    $str .= "<tr bgcolor='#C6D2D1'>"
                                ."<th align='right' colspan='2'>รวม {$tempCostCode} {$tempCostName}</th>"
                                ."<th align='right' >".number_format($sumCost,2)."</th>"
                            ."</tr>";

                    $sumCost = 0;
            }

            $tempCostCode = $row["cost_code"];
            $tempCostName = $row["cost_name"];
            $strCostName = "{$row["cost_code"]} {$row["cost_name"]}";
	}
        else
            $strCostName = "&nbsp;";
	
	$str .= "<tr>"
                    ."<td align='left'>&nbsp;{$strCostName}</td>"
                    ."<td align='left'>&nbsp;{$row["asset_code"]} {$row["asset_name"]}</td>"
                    ."<td align='right' >".number_format($row["f_depreciate"],2)."</td>"
		."</tr>";
	
	$sumCost += $row["f_depreciate"];
	$sumAll += $row["f_depreciate"];
}// end while
if ($sumCost > 0)
{
	$str .= "<tr bgcolor='#C6D2D1'>"
                ."<th align='right' colspan='2'>รวม {$tempCostCode} {$tempCostName}</th>"
                ."<th align='right' >".number_format($sumCost,2)."</th>"
            ."</tr>";
}

if ($sumAll > 0)
{
	$str .= "<tr bgcolor='#E2E8E9'>"
                    ."<th align='right' colspan='2'>รวมทั้งหมด</th>"
                    ."<th align='right' >".number_format($sumAll,2)."</th>"
                ."</tr>";
}
$str .= "</table>";

//-------------------------------------
$cost_name1 = ($cost_code1 != "") ? $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where c_code = ?", array($cost_code1)) : "เลือกทั้งหมด";
$cost_name2 = ($cost_code2 != "") ? $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where c_code = ?", array($cost_code2)) : "เลือกทั้งหมด";
$asset_group_name = ($asset_group != "") ? $db->GetDataBySQL("select c_code+' '+c_name from dc_asset_type where c_code = ?", array($asset_group)) : "เลือกทั้งหมด";

$mm1 = sprintf("%02d", $i_start_month);
$yyyy1 = ($i_start_year+543);
$strYM1 = $date->l_month_thai[$mm1]." ".$yyyy1;

$mm2 = sprintf("%02d", $i_end_month);
$yyyy2 = ($i_end_year+543);
$strYM2 = $date->l_month_thai[$mm2]." ".$yyyy2;

$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
            <tr><th colspan="3">'.$_REQUEST["titleReport"].'</th></tr>
            <tr><th colspan="3">หน่วยงาน  : '.$cost_name1.' ถึง '.$cost_name2.'</th></tr>
            <tr><th colspan="3">หมวดสินทรัพย์  : '.$asset_group_name.'</th></tr>
            <tr><th colspan="3">เดือน/ปีที่คำนวณค่าเสื่อม: '.$strYM1.' ถึง '.$strYM2.'</th></tr>
        </table>
        <table cellspacing="0" cellpadding="0" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
            <tr bgcolor="#A5BAD6">
                <th align="center"><b>หน่วยงาน</b></th>
                <th align="center"><b>ประเภทสินทรัพย์</b></th>
                <th align="center"><b>ค่าเสื่อมราคา</b></th>
            </tr>
'.$str;

if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str); 			
?>