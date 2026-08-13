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
$i_is_method = $_REQUEST["i_is_method"];
$dc_cost_id = $_REQUEST["dc_cost_id"];
$d_begin = (!empty($_REQUEST["d_begin"]))? $date->bc_to_ad($_REQUEST["d_begin"]) : null;
$d_end = (!empty($_REQUEST["d_end"]))? $date->bc_to_ad($_REQUEST["d_end"]) : null;
$i_c_code = $_REQUEST["i_c_code"];
//===========================================

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

$columnAll = 8+$i1;
$strData = "";
if ($i_c_code > 0)
{
    $strData = genReportByType($i_c_code, $i_is_method, $dc_cost_id, $d_begin, $d_end, $arrHdr, $i1);
    $txtShow = ($i_c_code == 1)? "ออกเลขรหัสสินทรัพย์แล้ว" : "ยังไม่ออกเลขรหัสสินทรัพย์";
}
else
{
    $strData = genReportByType(1, $i_is_method, $dc_cost_id, $d_begin, $d_end, $arrHdr, $i1); // ออกเลขรหัสสินทรัพย์แล้ว
    $strData .= genReportByType(2, $i_is_method, $dc_cost_id, $d_begin, $d_end, $arrHdr, $i1); // ยังไม่ออกเลขรหัสสินทรัพย์
    $txtShow = "เลือกทั้งหมด";
}
//-------------------------------------

$strDateBetween = $date->shot_date_from_db($d_begin). " ถึงวันที่  " .$date->shot_date_from_db($d_end);
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                    <tr><th colspan="'.$columnAll.'">'.$_REQUEST["titleReport"].' บริษัท อสมท จำกัด (มหาชน)</th></tr>
                    <tr><th colspan="'.$columnAll.'">หน่วยงานเจ้าของสินทรัพย์ : '.$_REQUEST["txts-dc_cost_id"].'</th></tr>
                    <tr><th colspan="'.$columnAll.'">วันทีได้มาตั้งแต่วันที่ '.$strDateBetween.'</th></tr>
                    <tr><th colspan="'.$columnAll.'" align="left">การแสดงรายการ : '.$txtShow.'</th></tr>
            </table>
            <table cellspacing="0" cellpadding="3" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                <tr bgcolor="#A5BAD6">
                    <th align="center" rowspan="2" nowrap><b>ลำดับที่</b></th>
                    <th align="center" rowspan="2" nowrap><b>หน่วยงานเจ้าของสินทรัพย์ </b></th>
                    <th align="center" rowspan="2" nowrap><b>รหัสสินทรัพย์</b></th>
                    <th align="center" rowspan="2" nowrap><b>ชื่อสินทรัพย์</b></th>
                    <th align="center" rowspan="2" nowrap><b>วันที่ได้มา/รับเข้า</b></th>
                    <th align="center" colspan="'.$i1.'" nowrap><b>หมวดสินทรัพย์และจำนวนเงิน (บาท)</b></th>
                    <th align="center" rowspan="2" nowrap><b>รวมทุนประกัน</b></th>
                    <th align="center" rowspan="2" nowrap><b>สถานะรายการ</b></th>
                    <th align="center" rowspan="2" nowrap><b>หมายเหตุ</b></th>
                </tr>
                <tr bgcolor="#A5BAD6">
                    '.$strHdr.'
                </tr>'
        .$strData;
//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str);

function genReportByType($i_c_code, $i_is_method, $dc_cost_id, $d_begin, $d_end, $arrHdr, $colHdr)
{
    $db 	= new DatabaseServer();
    $date 	= new i_date();
    
    $columnAll = 8+$colHdr;
    $strTypeShow = ($i_c_code == 1)? "ออกเลขรหัสสินทรัพย์แล้ว" : "ยังไม่ออกเลขรหัสสินทรัพย์";
    $str = "<tr bgcolor='#f0f4fa'><td colspan='{$columnAll}'><u>{$strTypeShow}</u></td></tr>";
    
    //============ gen where ===========
    $arrParam = array();
    $arrParam[] = $d_begin;
    $arrParam[] = $d_end;
    $sqlWhere = " and (b.d_receive_date between convert(datetime,?,102) and convert(datetime,?,102) Or b.d_receive_date is null) ";
    
    if ($i_c_code == 1) // -- ออกเลขแล้ว
        $sqlWhere .= " and c.dc_asset_id is not null ";
    else // ไม่ออกเลข
        $sqlWhere .= " and c.dc_asset_id is null ";
    
    if ($i_is_method > 0)
    {
        $sqlWhere .= " and isnull(c.i_is_ins, b.i_is_ins) = ? ";
        $arrParam[] = $i_is_method;
    }
    
    if ($dc_cost_id > 0)
    {
        $sqlWhere .= " and d.dc_cost_id = ? ";
        $arrParam[] = $dc_cost_id;
    }
    //========== end gen where =========
    
    $sqlGetMoney = "select b.am_tran_rg_dtl_id
                            , isnull(c.i_is_ins, b.i_is_ins) as dc_ins_group_id 
                            , isnull(b.c_cost_asset,0)-isnull(b.f_depreciate,0) as acc_cost
                    from am_tran_rg_hdr a
                            inner join am_tran_rg_dtl b on a.am_tran_rg_hdr_id = b.am_tran_rg_hdr_id
                            left join dc_asset c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
                            inner join dc_cost d on case when c.dc_asset_id is null then b.dc_cost_id
                                                    else
                                                            case when getdate() >= c.ta_date then  c.dc_cost_id_ta  else c.dc_cost_id end 
                                                    end = d.dc_cost_id
                    where b.i_is_success in (0,1) 
                            and b.dc_cost_id > 0 
                            and b.ins_is_method = 1 
                            and case when c.dc_asset_id is null then b.dc_cost_id
                                    else
                                            case when getdate() >= c.ta_date then  c.dc_cost_id_ta  else c.dc_cost_id end 
                                    end != 0
                            and (isnull(c.f_unit_cost,0)-isnull(c.f_depreciate_cost,0) )>1
                            and c.dc_asset_id not in (select dc_asset_id from am_ins_dtl where dc_asset_id = c.dc_asset_id)
                            {$sqlWhere}
                    ";
    $sMoney = $db->QueryParam($sqlGetMoney, $arrParam);
    $arrMoney = array();
    while ($rMoney = $db->Fetch($sMoney))
    {
        $arrMoney[$rMoney["am_tran_rg_dtl_id"]][$rMoney["dc_ins_group_id"]] = $rMoney["acc_cost"];
    }
     
    $sql = "select b.am_tran_rg_dtl_id
                    , d.c_code as cost_code
                    , d.c_name as cost_name
                    , case when c.dc_asset_id is null then b.c_code+'-xx-xxxxxx' else c.c_code end as asset_code
                    , b.c_name as asset_name
                    , isnull(convert(varchar(10), b.d_receive_date, 120) , '') as d_receive_date
                    , case when c.i_enable is null then '-'
                            else
                                    case when c.i_enable = 1 then 'ใช้งาน' else 'ตัดจำหน่าย' end
                            end as str_status
                    , isnull(c.c_comment, '') as c_comment
            from am_tran_rg_hdr a
                    inner join am_tran_rg_dtl b on a.am_tran_rg_hdr_id = b.am_tran_rg_hdr_id
                    left join dc_asset c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
                    inner join dc_cost d on case when c.dc_asset_id is null then b.dc_cost_id
                                                                    else
                                                                            case when getdate() >= c.ta_date then  c.dc_cost_id_ta  else c.dc_cost_id end 
                                                                    end = d.dc_cost_id
            where b.i_is_success in (0,1) 
                    and b.dc_cost_id > 0 
                    and b.ins_is_method = 1 
                    and case when c.dc_asset_id is null then b.dc_cost_id
                            else
                                    case when getdate() >= c.ta_date then  c.dc_cost_id_ta  else c.dc_cost_id end 
                            end != 0
                    and (isnull(c.f_unit_cost,0)-isnull(c.f_depreciate_cost,0) )>1
                    and c.dc_asset_id not in (select dc_asset_id from am_ins_dtl where dc_asset_id = c.dc_asset_id)
                    {$sqlWhere}
            order by cost_code, asset_code";
    $stmt = $db->QueryParam($sql, $arrParam);
    
    $countCost = 0;
    $countItems = 0;
    
    $arrSumCost = array();
    $sumCost = 0;
    $arrSumAll = array();
    $sumAll = 0;
    
    $showRow = 0;
    $tempCostCode = "";
    $tempCostName = "";
    while ($row = $db->Fetch($stmt))
    {
        if ($tempCostCode != $row["cost_code"])
        {
            if ($sumCost > 0)
            {
                $str .= "<tr bgcolor='#f0f4fa'>"
                            ."<td colspan='5' align='right'>รวมรายการสินทรัพย์หน่วยงาน {$tempCostName} ทั้งหมด {$showRow} รายการ</td>";
                
                if (is_array($arrHdr))
                {
                    foreach($arrHdr as $dc_ins_group_id)
                    {
                        $str .= "<td align='right'>".number_format($arrSumCost[$dc_ins_group_id], 2)."</td>";
                        $arrSumCost[$dc_ins_group_id] = 0;
                    }
                }
                $str .= "<td align='right'>".number_format($sumCost, 2)."</td>"
                        . "<td colspan='2'>&nbsp</td>"
                        . "</tr>";
                $sumCost = 0;
                $showRow = 0;
            }
            
            $countCost++;
            $str .= "<tr bgcolor='#f0f4fa'>"
                    ."<td align='center'>{$countCost}.</td>"
                    ."<td colspan='".($columnAll-1)."'>{$row["cost_name"]}</td>"
                 ."</tr>";
            $tempCostCode = $row["cost_code"];
            $tempCostName = $row["cost_name"];
        }// end if ($tempCostCode != $row["cost_code"]) 
        
        $countItems++;
        $showRow++;
        $sumLine = 0;
        $d_receive_date = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : '';
        $str .= "<tr>"
                ."<td align='center'>&nbsp;</td>"
                ."<td align='right'>{$showRow}.</td>"
                ."<td align='center' nowrap>&nbsp;{$row["asset_code"]}</td>"
                ."<td align='left'>&nbsp;{$row["asset_name"]}</td>"
                ."<td align='center' nowrap>&nbsp;{$d_receive_date}</td>";
                
        if (is_array($arrHdr))
        {
            foreach($arrHdr as $dc_ins_group_id)
            {
                if (@$arrMoney[$row["am_tran_rg_dtl_id"]][$dc_ins_group_id] > 0)
                    $money = $arrMoney[$row["am_tran_rg_dtl_id"]][$dc_ins_group_id];
                else 
                    $money = 0;
                
                $str .= "<td align='right'>".number_format($money, 2)."</td>";
                @$arrSumCost[$dc_ins_group_id] += $money;
                $sumCost += $money;
                @$arrSumAll[$dc_ins_group_id] += $money;
                $sumAll += $money;
                $sumLine += $money;
            }
        }
        
        $str .= "<td align='right'>".number_format($sumLine, 2)."</td>"
                . "<td align='center'>{$row["str_status"]}</td>"
                . "<td>&nbsp;{$row["c_comment"]}</td>"
                . "</tr>";
    }// end while
    
    if ($sumCost > 0)
    {
        $str .= "<tr bgcolor='#f0f4fa'>"
                    ."<td colspan='5' align='right'>รวมรายการสินทรัพย์หน่วยงาน {$tempCostName} ทั้งหมด {$showRow} รายการ</td>";

        if (is_array($arrHdr))
        {
            foreach($arrHdr as $dc_ins_group_id)
            {
                $str .= "<td align='right'>".number_format($arrSumCost[$dc_ins_group_id], 2)."</td>";
            }
        }
        $str .= "<td align='right'>".number_format($sumCost, 2)."</td>"
                . "<td colspan='2'>&nbsp</td>"
                . "</tr>";
    }
    

    $str .= "<tr bgcolor='#E2E8E9'>"
                ."<td colspan='5' align='right'>รวมรายการสินทรัพย์ {$strTypeShow} {$countCost} หน่วยงาน ทั้งหมด {$countItems} รายการ</td>";

    if (is_array($arrHdr))
    {
        foreach($arrHdr as $dc_ins_group_id)
        {
            $str .= "<td align='right'>".number_format(@$arrSumAll[$dc_ins_group_id], 2)."</td>";
        }
    }
    $str .= "<td align='right'>".number_format($sumAll, 2)."</td>"
            . "<td colspan='2'>&nbsp</td>"
            . "</tr>";
    
    return $str;
}
?>