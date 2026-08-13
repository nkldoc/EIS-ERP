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
$i_month = $_REQUEST["i_month"];
$i_year = $_REQUEST["i_year"];
$i_process_depre = $_REQUEST["i_process_depre"];
//===========================================
$inv_code = "";
$c_yyyy_mm = sprintf("%04d%02d", $i_year, $i_month);

$arrParam[] = STATUS_ENABLE;
$arrParam[] = STATUS_ENABLE;
$arrParam[] = DELETE_FALSE;
$arrParam[] = 'AD';
$arrParam[] = ASSET_CAL_YES;
$arrParam[] = $c_yyyy_mm;

$sqlWhere = "";
if ($asset_group != "")
{
    $sqlWhere .= " and c.c_code like ?";
    $arrParam[] = "{$asset_group}%";
}
    
if ($cost_code1 != "" && $cost_code2 != "")
{
    $sqlWhere .= " and e.c_code between ? and ?";
    $arrParam[] = $cost_code1;
    $arrParam[] = $cost_code2;
}

if ($i_process_depre > 0)
{
    $sqlWhere .= " and c.i_process_depre = ?";
    $arrParam[] = $i_process_depre;
}

$sql = "select e.c_code as cost_code
            , e.c_name as cost_name
            , d.c_code as group_code
            , d.c_name as group_name
            , c.c_code as asset_code
            , rg.c_name as asset_name
            , isnull(convert(varchar(10), rg.d_receive_date, 120), '') as d_receive_date
            , isnull(convert(varchar(10), rg.d_register_date, 120), '') as d_register_date
            , isnull(c.f_unit_cost , 0) as f_unit_cost
            , isnull(c.c_cost_ruins, 0) as c_cost_ruins
            , isnull(c.i_period_year, 0) as i_period_year
            , isnull(b.f_depreciate_af, 0) as f_depreciate_af
            , isnull(b.f_depre, 0) as f_depre
            , isnull(b.f_salv, 0) as f_salv
            , isnull(b.acc_depre_cost, 0) as acc_depre_cost
        from gl_depre_hdr a
            inner join gl_asset_depre b on b.gl_depre_hdr_id=a.gl_depre_hdr_id
            inner join dc_asset c on b.dc_asset_id=c.dc_asset_id
            inner join am_tran_rg_dtl rg on c.am_tran_rg_dtl_id = rg.am_tran_rg_dtl_id
            inner join dc_asset_type d on left(c.c_code, 2) = d.c_code
            inner join dc_cost e on b.dc_cost_id = e.dc_cost_id
        where a.i_enable = ?
            and d.i_enable = ? 
            and d.i_delete = ?
            and left(a.c_code, 2) = ?
            and rg.i_is_expense = ?
            and a.c_yyyy_mm = ?
            {$sqlWhere}
        order by cost_code, group_code, asset_code";

//echo $sqlWhere ; print_r($arrParam);exit;
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$colspan = 12;
$str = "";
$countItems = 0;
$allItems = 0;

$sumGroup_cost = 0;
$sumGroup_ruins = 0;
$sumGroup_begin = 0;
$sumGroup_depre = 0;
$sumGroup_after = 0;
$sumGroup_acc = 0;

$sumCost_cost = 0;
$sumCost_ruins = 0;
$sumCost_begin = 0;
$sumCost_depre = 0;
$sumCost_after = 0;
$sumCost_acc = 0;

$sumAll_cost = 0;
$sumAll_ruins = 0;
$sumAll_begin = 0;
$sumAll_depre = 0;
$sumAll_after = 0;
$sumAll_acc = 0;

$tempCostCode = "";
$tempCostName = "";

$tempGroupCode = "";
$tempGroupName = "";

while ($row = $db->Fetch($stmt))
{
    if ($tempCostCode != $row["cost_code"])
    {
        if ($sumGroup_cost > 0)
        {
            $str .= "<tr bgcolor='#f0f4fa'>"
                    ."<td align='right' colspan='5'>รวมหมวดสินทรัพย์ : {$tempGroupName}</td>"
                    ."<td align='right' >".number_format($sumGroup_cost,2)."</td>"
                    ."<td align='right' >".number_format($sumGroup_ruins,2)."</td>"
                    ."<td align='left'>&nbsp;</td>"
                    ."<td align='right' >".number_format($sumGroup_begin,2)."</td>"
                    ."<td align='right' >".number_format($sumGroup_depre,2)."</td>"
                    ."<td align='right' >".number_format($sumGroup_after,2)."</td>"
                    ."<td align='right' >".number_format($sumGroup_acc,2)."</td>"
                ."</tr>";

            $sumGroup_cost = 0;
            $sumGroup_ruins = 0;
            $sumGroup_begin = 0;
            $sumGroup_depre = 0;
            $sumGroup_after = 0;
            $sumGroup_acc = 0;

            $countItems = 0;
            $tempGroupCode = "";
            $tempGroupName = "";
        }

        if ($sumCost_cost > 0)
        {
            $str .= "<tr bgcolor='#C6D2D1'>"
                    ."<td align='right' colspan='5'>รวมหน่วยงาน : {$tempCostName}</td>"
                    ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
                    ."<td align='right' >".number_format($sumCost_ruins,2)."</td>"
                    ."<td align='left'>&nbsp;</td>"
                    ."<td align='right' >".number_format($sumCost_begin,2)."</td>"
                    ."<td align='right' >".number_format($sumCost_depre,2)."</td>"
                    ."<td align='right' >".number_format($sumCost_after,2)."</td>"
                    ."<td align='right' >".number_format($sumCost_acc,2)."</td>"
                ."</tr>";

            $sumCost_cost = 0;
            $sumCost_ruins = 0;
            $sumCost_begin = 0;
            $sumCost_depre = 0;
            $sumCost_after = 0;
            $sumCost_acc = 0;
        }

        $str .= "<tr bgcolor='#C6D2D1'>"
                ."<td align='left' colspan='{$colspan}'>หน่วยงาน :{$row["cost_name"]}</td>"
                ."</tr>";

        $tempCostCode = $row["cost_code"];
        $tempCostName = $row["cost_name"];

    }

    if ($tempGroupCode != $row["group_code"])
    {
        if ($sumGroup_cost > 0)
        {
            $str .= "<tr bgcolor='#f0f4fa'>"
                    ."<td align='right' colspan='5'>รวมหมวดสินทรัพย์ : {$tempGroupName}</td>"
                    ."<td align='right' >".number_format($sumGroup_cost,2)."</td>"
                    ."<td align='right' >".number_format($sumGroup_ruins,2)."</td>"
                    ."<td align='left'>&nbsp;</td>"
                    ."<td align='right' >".number_format($sumGroup_begin,2)."</td>"
                    ."<td align='right' >".number_format($sumGroup_depre,2)."</td>"
                    ."<td align='right' >".number_format($sumGroup_after,2)."</td>"
                    ."<td align='right' >".number_format($sumGroup_acc,2)."</td>"
                ."</tr>";

            $sumGroup_cost = 0;
            $sumGroup_ruins = 0;
            $sumGroup_begin = 0;
            $sumGroup_depre = 0;
            $sumGroup_after = 0;
            $sumGroup_acc = 0;

            $countItems = 0;
            $tempGroupCode = "";
            $tempGroupName = "";
        }

        $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='left' colspan='{$colspan}'>หมวดสินทรัพย์ : {$row["group_name"]}</td>"
                ."</tr>";

        $tempGroupCode = $row["group_code"];
        $tempGroupName = $row["group_name"];

    }

    $allItems++;
    $countItems++;
    $d_receive_date = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : '';
    $d_register_date = ($row["d_register_date"] != "")? $date->shot_date_from_db($row["d_register_date"]) : '';
    
    $str .= "<tr>"
                ."<td align='center'>{$countItems}.</td>"
                ."<td align='center'>&nbsp;{$row["asset_code"]}</td>"
                ."<td align='left'>&nbsp;{$row["asset_name"]}</td>"
                ."<td align='center'>&nbsp;{$d_receive_date}</td>"
                ."<td align='center'>&nbsp;{$d_register_date}</td>"
                ."<td align='right' >".number_format($row["f_unit_cost"],2)."</td>"
                ."<td align='right' >".number_format($row["c_cost_ruins"],2)."</td>"
                ."<td align='center' >".number_format($row["i_period_year"],2)."</td>"
                ."<td align='right' >".number_format($row["f_depreciate_af"],2)."</td>"
                ."<td align='right' >".number_format($row["f_depre"],2)."</td>"
                ."<td align='right' >".number_format($row["f_salv"],2)."</td>"
                ."<td align='right' >".number_format($row["acc_depre_cost"],2)."</td>"
        ."</tr>";

    $sumGroup_cost += $row["f_unit_cost"];
    $sumGroup_ruins += $row["c_cost_ruins"];
    $sumGroup_begin += $row["f_depreciate_af"];
    $sumGroup_depre += $row["f_depre"];
    $sumGroup_after += $row["f_salv"];
    $sumGroup_acc += $row["acc_depre_cost"];

    $sumCost_cost += $row["f_unit_cost"];
    $sumCost_ruins += $row["c_cost_ruins"];
    $sumCost_begin += $row["f_depreciate_af"];
    $sumCost_depre += $row["f_depre"];
    $sumCost_after += $row["f_salv"];
    $sumCost_acc += $row["acc_depre_cost"];

    $sumAll_cost += $row["f_unit_cost"];
    $sumAll_ruins += $row["c_cost_ruins"];
    $sumAll_begin += $row["f_depreciate_af"];
    $sumAll_depre += $row["f_depre"];
    $sumAll_after += $row["f_salv"];
    $sumAll_acc += $row["acc_depre_cost"];
}// end while

if ($sumGroup_cost > 0)
{
    $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='right' colspan='5'>รวมหมวดสินทรัพย์ : {$tempGroupName}</td>"
                ."<td align='right' >".number_format($sumGroup_cost,2)."</td>"
                ."<td align='right' >".number_format($sumGroup_ruins,2)."</td>"
                ."<td align='left'>&nbsp;</td>"
                ."<td align='right' >".number_format($sumGroup_begin,2)."</td>"
                ."<td align='right' >".number_format($sumGroup_depre,2)."</td>"
                ."<td align='right' >".number_format($sumGroup_after,2)."</td>"
                ."<td align='right' >".number_format($sumGroup_acc,2)."</td>"
            ."</tr>";
}

if ($sumCost_cost > 0)
{
    $str .= "<tr bgcolor='#C6D2D1'>"
                ."<td align='right' colspan='5'>รวมหน่วยงาน : {$tempCostName}</td>"
                ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
                ."<td align='right' >".number_format($sumCost_ruins,2)."</td>"
                ."<td align='left'>&nbsp;</td>"
                ."<td align='right' >".number_format($sumCost_begin,2)."</td>"
                ."<td align='right' >".number_format($sumCost_depre,2)."</td>"
                ."<td align='right' >".number_format($sumCost_after,2)."</td>"
                ."<td align='right' >".number_format($sumCost_acc,2)."</td>"
            ."</tr>";
}

if ($sumAll_cost > 0)
{
	$str .= "<tr bgcolor='#E2E8E9'>"
                ."<td align='left' colspan='2'>รวม {$allItems} รายการ</td>"
                ."<td align='right' colspan='3'>รวมทั้งหมด</td>"
                ."<td align='right' >".number_format($sumAll_cost,2)."</td>"
                ."<td align='right' >".number_format($sumAll_ruins,2)."</td>"
                ."<td align='left'>&nbsp;</td>"
                ."<td align='right' >".number_format($sumAll_begin,2)."</td>"
                ."<td align='right' >".number_format($sumAll_depre,2)."</td>"
                ."<td align='right' >".number_format($sumAll_after,2)."</td>"
                ."<td align='right' >".number_format($sumAll_acc,2)."</td>"
            ."</tr>";
}

$str .= "</table>";

//-------------------------------------
$strGroup = ($asset_group != "")? $db->GetDataBySQL("select c_name from dc_asset_type where c_code = ?", array($asset_group)) : "เลือกทั้งหมด";
$i_month = sprintf("%02d", $i_month);
$depreAt = $date->l_month_thai[$i_month]." พ.ศ. ".($i_year+543);
switch($i_process_depre){
    case 1 :
        $strProcess = "คิดค่าเสื่อมราคาในเดือน";
        break;
    case 2 :
        $strProcess = "ไม่คิดค่าเสื่อมราคาแล้ว";
        break;
    default :
        $strProcess = "ทั้งหมด ";
        break;
}
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="'.$colspan.'">'.$_REQUEST["titleReport"].'</th></tr>
			<tr><th colspan="'.$colspan.'">ประจำเดือน '.$depreAt.'</th></tr>
                        <tr><th colspan="'.$colspan.'">สถานะสินทรัพย์ '.$strProcess.'</th></tr>
                        <tr><th align="left" colspan="'.$colspan.'">หมวดสินทรัพย์ : '.$strGroup.'</th></tr>
		</table>
		<table cellspacing="0" cellpadding="0" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                    <tr bgcolor="#A5BAD6">
                        <th align="center"><b>ลำดับที่</b></th>
                        <th align="center"><b>รหัสสินทรัพย์</b></th>
                        <th align="center"><b>ชื่อสินทรัพย์</b></th>
                        <th align="center"><b>วันที่ได้มา</b></th>
                        <th align="center"><b>วันที่ขึ้นทะเบียน</b></th>
                        <th align="center"><b>ราคาทุน </b></th>
                        <th align="center"><b>มูลค่าซาก</b></th>
                        <th align="center"><b>อายุใช้งาน (ปี)</b></th>
                        <th align="center"><b>ค่าเสื่อมราคาสะสมยกมา</b></th>
                        <th align="center"><b>ค่าเสื่อมราคาประจำเดือน</b></th>
                        <th align="center"><b>ค่าเสื่อมราคาสะสมยกไป</b></th>
                        <th align="center"><b>ราคาตามบัญชี</b></th>
                    </tr>
'.$str;
//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str);
?>