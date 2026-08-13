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
$am_ins_hdr_id = $_REQUEST["am_ins_hdr_id"];
$dc_ins_town_hdr_id = $_REQUEST["dc_ins_town_hdr_id"];
$i_is_method = $_REQUEST["i_is_method"];
$dc_building_id = $_REQUEST["dc_building_id"];
$i_start_month = $_REQUEST["i_month"];
$i_start_year = $_REQUEST["i_year"];
//===========================================
$txtBuild = $db->GetDataBySQL("select c_code+' '+c_name from dc_building where dc_building_id = ?", array($dc_building_id));
$txtTownHdr = $db->GetDataBySQL("select c_name from dc_ins_town_hdr where dc_ins_town_hdr_id = ?", array($dc_ins_town_hdr_id));

$arrParam[] = DELETE_FALSE;

$sql = "select dc_ins_method_id, c_name from dc_ins_method where i_delete = ?";

if ($i_is_method > 0)
{
    $sql .= " and dc_ins_method_id = ?";
    $arrParam[] = $i_is_method;
}

$stmt = $db->QueryParam($sql, $arrParam);
$str = "";
while ($row = $db->Fetch($stmt))
{
    $str .= genReportByType($row["dc_ins_method_id"], $dc_building_id, $dc_ins_town_hdr_id, $row["c_name"], $txtBuild, $txtTownHdr, $i_start_month, $i_start_year);
}// end while
//-------------------------------------

//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str);

function genReportByType($i_type, $dc_building_id, $dc_ins_town_hdr_id, $type_name, $txtBuild, $txtTownHdr, $i_start_month, $i_start_year)
{
    $db 	= new DatabaseServer();
    $date 	= new i_date();
    $sqlHdr = "select dc_ins_group_id, c_name from dc_ins_group where i_enable =?";
    $sHdr = $db->QueryParam($sqlHdr, array(STATUS_ENABLE));
    $i1=0;
    $strHdr = "";
    $arrHdr = array();
    while ($rHdr = $db->Fetch($sHdr))
    {
        $i1++;
        $strHdr .='<th align="center" nowrap><b>'.$rHdr["c_name"].'</b></th>';
        $arrHdr[] = $rHdr["dc_ins_group_id"];
    }
    $columnAll = 4+$i1;
    
    //============ gen where ===========
    $c_yyyy_mm1 = sprintf("%04d%02d", $i_start_year, $i_start_month);
    $c_yyyy_mm2 = sprintf("%04d%02d", $i_start_year, 12);
    $sqlWhere = " and cast(year(a.d_start_ins) as varchar(4))+ right('0'+cast(month(a.d_start_ins) as varchar(2)),2) between '{$c_yyyy_mm1}' and '{$c_yyyy_mm2}' ";
    
    if ($dc_building_id > 0)
    {
        $sqlWhere .= " and a.dc_building_id = {$dc_building_id} ";
    }
    
    if ($dc_ins_town_hdr_id > 0)
    {
        $sqlWhere .= " and a.dc_ins_town_hdr_id = {$dc_ins_town_hdr_id} ";
    }
    //========== end gen where =========
    
    $sqlGetMoney = "select b.dc_ins_town_hdr_id
                        , c.i_is_ins as dc_ins_group_id 
                        , sum(isnull(d.c_cost_asset,0)-isnull(d.f_depreciate,0)) as acc_cost
                    from am_ins_hdr a
                        inner join am_ins_dtl b on a.am_ins_hdr_id = b.am_ins_hdr_id
                        inner join dc_asset c on b.dc_asset_id = c.dc_asset_id
                        inner join am_tran_rg_dtl d on c.am_tran_rg_dtl_id = d.am_tran_rg_dtl_id
                    where a.i_enable = ?
                        and b.i_enable = ?
                        and c.i_enable = ? 
                        and c.ins_is_method = ?
                        and a.i_is_method = ?
                        {$sqlWhere}
                    group by b.dc_ins_town_hdr_id, c.i_is_ins
                    ";
    $sMoney = $db->QueryParam($sqlGetMoney, array(STATUS_ENABLE, STATUS_ENABLE, STATUS_ENABLE, 1, $i_type));
    $arrMoney = array();
    while ($rMoney = $db->Fetch($sMoney))
    {
        $arrMoney[$rMoney["dc_ins_town_hdr_id"]][$rMoney["dc_ins_group_id"]] = $rMoney["acc_cost"];
    }
                        
    $mm1 = sprintf("%02d", $i_start_month);
    $yyyy = ($i_start_year+543);
    $strYM1 = $date->l_month_thai[$mm1]." ".$yyyy;
    $strYM2 = $date->l_month_thai[12]." ".$yyyy;
    $str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                    <tr><th colspan="'.$columnAll.'">รายงานสรุปแจ้งประกันภัย'.$type_name.' บริษัท อสมท จำกัด (มหาชน)</th></tr>
                    <tr><th colspan="'.$columnAll.'">เดือน/ปีที่เอาประกันภัย : '.$strYM1.' ถึง '.$strYM2.'</th></tr>
                    <tr><th colspan="'.$columnAll.'" align="left">กลุ่มอาคาร/สถานที่เอาประกัน : '.$txtBuild.'</th></tr>
                    <tr><th colspan="'.$columnAll.'" align="left">ชื่ออาคาร : '.$txtTownHdr.'</th></tr>
            </table>
            <table cellspacing="0" cellpadding="3" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                <tr bgcolor="#A5BAD6">
                    <th align="center" rowspan="2" nowrap><b>ลำดับที่</b></th>
                    <th align="center" rowspan="2" nowrap><b>สถานที่ใช้งาน </b></th>
                    <th align="center" colspan="'.$i1.'" nowrap><b>หมวดสินทรัพย์และจำนวนเงิน (บาท)</b></th>
                    <th align="center" rowspan="2" nowrap><b>รวมทุนประกัน</b></th>
                    <th align="center" rowspan="2" nowrap><b>หมายเหตุ</b></th>
                </tr>
                <tr bgcolor="#A5BAD6">
                    '.$strHdr.'
                </tr>
    ';
    
    $sql = "select a.dc_building_id
                , e.c_code as build_code
                , e.c_name as build_name
                , d.dc_ins_town_hdr_id
                , d.c_name 
            from am_ins_hdr a
                inner join am_ins_dtl b on b.am_ins_hdr_id=a.am_ins_hdr_id
                inner join dc_asset c on b.dc_asset_id=c.dc_asset_id
                inner join dc_ins_town_hdr d on b.dc_ins_town_hdr_id=d.dc_ins_town_hdr_id
                inner join dc_building e on a.dc_building_id = e.dc_building_id
            where a.i_enable= ? 
                and b.i_enable= ? 
                and d.i_enable= ?
                and a.i_is_method= ?
                {$sqlWhere}
            group by a.dc_building_id, e.c_code, e.c_name, d.dc_ins_town_hdr_id, d.c_name
            order by build_name, d.c_name";
    $stmt = $db->QueryParam($sql, array(STATUS_ENABLE, STATUS_ENABLE, STATUS_ENABLE, $i_type));
    
    $tempBuild = "";
    
    $arrSumBuild = array();
    $sumBuild = 0;
    $arrSumAll = array();
    $sumAll = 0;
    $countItems = 0;
    while ($row = $db->Fetch($stmt))
    {
        if ($tempBuild != $row["build_name"])
        {
            if ($sumBuild > 0)
            {
                $str .= "<tr bgcolor='#f0f4fa'>"
                            ."<td colspan='2' align='right'>รวม</td>";
                
                if (is_array($arrHdr))
                {
                    foreach($arrHdr as $dc_ins_group_id)
                    {
                        $str .= "<td align='right'>".number_format($arrSumBuild[$dc_ins_group_id], 2)."</td>";
                        $arrSumBuild[$dc_ins_group_id] = 0;
                    }
                }
                $str .= "<td align='right'>".number_format($sumBuild, 2)."</td>"
                        . "<td>&nbsp</td>"
                        . "</tr>";
                $sumBuild = 0;
            }
            
            $str .= "<tr bgcolor='#f0f4fa'>"
                    ."<td colspan='{$columnAll}'>กลุ่มอาคาร/สถานที่เอาประกัน : {$row["build_name"]}</td>"
                 ."</tr>";
            $tempBuild = $row["build_name"];
        }// end if ($tempBuild != $row["build_name"]) 
        
        $countItems++;
        $sumLine = 0;
        $strName = "<a href='RepAm018b.php?i_year={$i_start_year}&i_month={$i_start_month}&i_is_method={$i_type}&dc_building_id={$row["dc_building_id"]}&dc_ins_town_hdr_id={$row["dc_ins_town_hdr_id"]}'>{$row["c_name"]}</a>";
        $str .= "<tr>"
                ."<td align='center'>{$countItems}.</td>"
                ."<td align='left' nowrap>&nbsp;{$strName}</td>";
                
        if (is_array($arrHdr))
        {
            foreach($arrHdr as $dc_ins_group_id)
            {
                if (@$arrMoney[$row["dc_ins_town_hdr_id"]][$dc_ins_group_id] > 0)
                    $money = $arrMoney[$row["dc_ins_town_hdr_id"]][$dc_ins_group_id];
                else 
                    $money = 0;
                
                $str .= "<td align='right'>".number_format($money, 2)."</td>";
                @$arrSumBuild[$dc_ins_group_id] += $money;
                $sumBuild += $money;
                @$arrSumAll[$dc_ins_group_id] += $money;
                $sumAll += $money;
                $sumLine += $money;
            }
        }
        
        $str .= "<td align='right'>".number_format($sumLine, 2)."</td>"
                . "<td>&nbsp;</td>"
                . "</tr>";
    }
    //-------------------------------------------------------------
    if ($sumBuild > 0)
    {
        $str .= "<tr bgcolor='#f0f4fa'>"
                    ."<td colspan='2' align='right'>รวม</td>";

        if (is_array($arrHdr))
        {
            foreach($arrHdr as $dc_ins_group_id)
            {
                $str .= "<td align='right'>".number_format($arrSumBuild[$dc_ins_group_id], 2)."</td>";
            }
        }
        $str .= "<td align='right'>".number_format($sumBuild, 2)."</td>"
                . "<td>&nbsp</td>"
                . "</tr>";
    }
    
    if ($sumAll > 0)
    {
        $str .= "<tr bgcolor='#E2E8E9'>"
                    ."<td colspan='2' align='right'>รวมทั้งสิ้น</td>";

        if (is_array($arrHdr))
        {
            foreach($arrHdr as $dc_ins_group_id)
            {
                $str .= "<td align='right'>".number_format($arrSumAll[$dc_ins_group_id], 2)."</td>";
            }
        }
        $str .= "<td align='right'>".number_format($sumAll, 2)."</td>"
                . "<td>&nbsp</td>"
                . "</tr>";
    }
    $str .= "</table>";
    return $str;
}
?>