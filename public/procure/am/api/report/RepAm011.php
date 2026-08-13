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
$dc_cost_id = $_REQUEST["dc_cost_id"];
$i_month = $_REQUEST["i_month"];
$i_year = $_REQUEST["i_year"];
//===========================================
$inv_code = "";
$c_yyyy_mm = sprintf("%04d%02d", $i_year, $i_month);

$arrParam[] = $c_yyyy_mm;

$sqlWhere = "";
if ($asset_type != "")
{
    $sqlWhere .= " and a.dc_code like ?";
    $arrParam[] = "{$asset_type}%";
}
else if ($asset_group != "")
{
    $sqlWhere .= " and a.dc_code like ?";
    $arrParam[] = "{$asset_group}%";
}
    
if ($dc_cost_id > 0)
{
    $sqlWhere .= " and a.dc_cost_id = ?";
    $arrParam[] = $dc_cost_id;
}

$sql = "select b.c_code as cost_code
                , b.c_name as cost_name
                , c.c_code as inv_code
                , c.c_name as inv_name
                , a.dc_code
                , a.am_name
                , a.f_unit_cost
                , a.c_cost_ruins
                , a.f_salv
                , a.acc_depre_cost
                , isnull(convert(varchar(10), a.d_doc_date, 120),'') as d_doc_date
        from vw_end_depreciate  a  
                inner join dc_cost b on a.dc_cost_id = b.dc_cost_id
                inner join dc_asset_type c on left(a.dc_code, 4) = c.c_code
        where a.c_yyyy_mm <= ?
            {$sqlWhere}
        order by cost_code, inv_code, a.dc_code";
//echo $sqlWhere ; print_r($arrParam);exit;
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";
$countItems = 0;

$sumInv_cost = 0;
$sumInv_ruins = 0;
$sumInv_depre = 0;
$sumInv_acc = 0;

$sumCost_cost = 0;
$sumCost_ruins = 0;
$sumCost_depre = 0;
$sumCost_acc = 0;

$sumAll_cost = 0;
$sumAll_ruins = 0;
$sumAll_depre = 0;
$sumAll_acc = 0;

$tempCostCode = "";
$tempCostName = "";

$tempInvCode = "";
$tempInvName = "";

while ($row = $db->Fetch($stmt))
{
    if ($tempCostCode != $row["cost_code"])
    {
        if ($sumInv_cost > 0)
        {
            $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='right' colspan='3'>รวม {$tempInvCode}: {$tempInvName}</td>"
                ."<td align='right' >".number_format($sumInv_cost,2)."</td>"
                ."<td align='right' >".number_format($sumInv_ruins,2)."</td>"
                ."<td align='right' >".number_format($sumInv_depre,2)."</td>"
                ."<td align='right' >".number_format($sumInv_acc,2)."</td>"
                ."<td align='left'>&nbsp;</td>"
            ."</tr>";

            $sumInv_cost = 0;
            $sumInv_ruins = 0;
            $sumInv_depre = 0;
            $sumInv_acc = 0;

            $countItems = 0;
            $tempInvCode = "";
            $tempInvName = "";
        }

        if ($sumCost_cost > 0)
        {
            $str .= "<tr bgcolor='#C6D2D1'>"
                        ."<td align='right' colspan='3'>รวม {$tempCostCode}: {$tempCostName}</td>"
                        ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
                        ."<td align='right' >".number_format($sumCost_ruins,2)."</td>"
                        ."<td align='right' >".number_format($sumCost_depre,2)."</td>"
                        ."<td align='right' >".number_format($sumCost_acc,2)."</td>"
                        ."<td align='left'>&nbsp;</td>"
                    ."</tr>";

            $sumCost_cost = 0;
            $sumCost_ruins = 0;
            $sumCost_depre = 0;
            $sumCost_acc = 0;

        }

        $str .= "<tr bgcolor='#C6D2D1'>"
                ."<td align='left' colspan='8'>{$row["cost_code"]} {$row["cost_name"]}</td>"
                ."</tr>";

        $tempCostCode = $row["cost_code"];
        $tempCostName = $row["cost_name"];

    }

    if ($tempInvCode != $row["inv_code"])
    {

        if ($sumInv_cost > 0)
        {
            $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='right' colspan='3'>รวม {$tempInvCode}: {$tempInvName}</td>"
                ."<td align='right' >".number_format($sumInv_cost,2)."</td>"
                ."<td align='right' >".number_format($sumInv_ruins,2)."</td>"
                ."<td align='right' >".number_format($sumInv_depre,2)."</td>"
                ."<td align='right' >".number_format($sumInv_acc,2)."</td>"
                ."<td align='left'>&nbsp;</td>"
            ."</tr>";

            $sumInv_cost = 0;
            $sumInv_ruins = 0;
            $sumInv_depre = 0;
            $sumInv_acc = 0;

            $countItems = 0;
            $tempInvCode = "";
            $tempInvName = "";
        }

        $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='left' colspan='8'>{$row["inv_code"]} {$row["inv_name"]}</td>"
                ."</tr>";

        $tempInvCode = $row["inv_code"];
        $tempInvName = $row["inv_name"];

    }

    $countItems++;
    $d_doc_date = ($row["d_doc_date"] != "")? $date->shot_date_from_db($row["d_doc_date"]) : '';
    $str .= "<tr>"
                ."<td align='center'>{$countItems}.</td>"
                ."<td align='center' nowrap>&nbsp;{$row["dc_code"]}</td>"
                ."<td align='left'>&nbsp;{$row["am_name"]}</td>"
                ."<td align='right'  nowrap>".number_format($row["f_unit_cost"],2)."</td>"
                ."<td align='right'  nowrap>".number_format($row["c_cost_ruins"],2)."</td>"
                ."<td align='right'  nowrap>".number_format($row["f_salv"],2)."</td>"
                ."<td align='right'  nowrap>".number_format($row["acc_depre_cost"],2)."</td>"
                ."<td align='center' nowrap>{$d_doc_date}</td>"
        ."</tr>";

    $sumInv_cost += $row["f_unit_cost"];
    $sumInv_ruins += $row["c_cost_ruins"];
    $sumInv_depre += $row["f_salv"];
    $sumInv_acc += $row["acc_depre_cost"];

    $sumCost_cost += $row["f_unit_cost"];
    $sumCost_ruins += $row["c_cost_ruins"];
    $sumCost_depre += $row["f_salv"];
    $sumCost_acc += $row["acc_depre_cost"];

    $sumAll_cost += $row["f_unit_cost"];
    $sumAll_ruins += $row["c_cost_ruins"];
    $sumAll_depre += $row["f_salv"];
    $sumAll_acc += $row["acc_depre_cost"];
}// end while
if ($sumInv_cost > 0)
{
    $str .= "<tr bgcolor='#f0f4fa'>"
            ."<td align='right' colspan='3'>รวม {$tempInvCode}: {$tempInvName}</td>"
            ."<td align='right' >".number_format($sumInv_cost,2)."</td>"
            ."<td align='right' >".number_format($sumInv_ruins,2)."</td>"
            ."<td align='right' >".number_format($sumInv_depre,2)."</td>"
            ."<td align='right' >".number_format($sumInv_acc,2)."</td>"
            ."<td align='left'>&nbsp;</td>"
        ."</tr>";
}

if ($sumCost_cost > 0)
{
    $str .= "<tr bgcolor='#C6D2D1'>"
            ."<td align='right' colspan='3'>รวม {$tempCostCode}: {$tempCostName}</td>"
            ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
            ."<td align='right' >".number_format($sumCost_ruins,2)."</td>"
            ."<td align='right' >".number_format($sumCost_depre,2)."</td>"
            ."<td align='right' >".number_format($sumCost_acc,2)."</td>"
            ."<td align='left'>&nbsp;</td>"
        ."</tr>";
}

if ($sumAll_cost > 0)
{
	$str .= "<tr bgcolor='#E2E8E9'>"
            ."<td align='right' colspan='3'>รวมทั้งหมด</td>"
            ."<td align='right' >".number_format($sumAll_cost,2)."</td>"
            ."<td align='right' >".number_format($sumAll_ruins,2)."</td>"
            ."<td align='right' >".number_format($sumAll_depre,2)."</td>"
            ."<td align='right' >".number_format($sumAll_acc,2)."</td>"
            ."<td align='left'>&nbsp;</td>"
            ."</tr>";
}

$str .= "</table>";

//-------------------------------------
$mm = sprintf("%02d", $i_month);
$yyyy = ($i_year+543);
$strYM = $date->l_month_thai[$mm]." ".$yyyy;

$costName = ($dc_cost_id > 0)? $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where dc_cost_id = ?", array($dc_cost_id)) : "ทุกหน่วยงาน";

if ($asset_type != "")
    $invName = $db->GetDataBySQL ("select c_code+' '+c_name from dc_asset_type where c_code = ?", array($asset_type));
else if ($asset_group != "")
    $invName = $db->GetDataBySQL ("select c_code+' '+c_name from dc_asset_type where c_code = ?", array($asset_group));
else
    $invName = "เลือกทั้งหมด";
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="8">'.$_REQUEST["titleReport"].'</th></tr>
			<tr><th colspan="8">เดือน/ปี ที่คำนวณค่าเสื่อมราคาครั้งสุดท้าย : '.$strYM.'</th></tr>
			<tr><td colspan="8" align="left"><b>หน่วยงานเจ้าของสินทรัพย์  :</b> '.$costName.'</td></tr>
                        <tr><td colspan="8" align="left"><b>หมวดสินทรัพย์ :</b> '.$invName.'</td></tr>
                        <tr><td colspan="8" align="right">หน่วย : บาท</td></tr>
		</table>
		<table cellspacing="0" cellpadding="3" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                    <tr bgcolor="#A5BAD6">
                        <th align="center" nowrap><b>ลำดับที่</b></th>
                        <th align="center" nowrap><b>รหัสสินทรัพย์</b></th>
                        <th align="center" nowrap><b>ชื่อสินทรัพย์</b></th>
                        <th align="center" nowrap><b>ราคาทุน </b></th>
                        <th align="center" nowrap><b>มูลค่าซาก</b></th>
                        <th align="center" nowrap><b>ค่าเสื่อมราคาสะสม</b></th>
                        <th align="center" nowrap><b>ราคาตามบัญชี</b></th>
                        <th align="center"><b>วันที่คำนวณค่าเสื่อมราคาครั้งสุดท้าย</b></th>
                    </tr>
'.$str;
//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str);
?>