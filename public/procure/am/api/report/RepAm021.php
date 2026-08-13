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
$sd_code_start = $_REQUEST["sd_code_start"];
$sd_code_end = $_REQUEST["sd_code_end"];
$dc_cost_id = (!empty($_REQUEST["dc_cost_id"]))? $_REQUEST["dc_cost_id"] : 0;
$i_is_expense = $_REQUEST["i_is_expense"];
//===========================================

$columnAll = 13;
$strData = "";
if ($i_is_expense == 2)
{
    $strData = genReportByType(ASSET_CAL_YES, $sd_code_start, $sd_code_end, $dc_cost_id); // คำนวณค่าเสื่อมราคา
    $strData .= genReportByType(ASSET_CAL_NO, $sd_code_start, $sd_code_end, $dc_cost_id); // ไม่คำนวณค่าเสื่อมราคา
    $txtShow = "เลือกทั้งหมด";
}
else
{
    $strData = genReportByType($i_is_expense, $sd_code_start, $sd_code_end, $dc_cost_id);
    $txtShow = ($i_is_expense == ASSET_CAL_YES)? "คำนวณค่าเสื่อมราคา" : "ไม่คำนวณค่าเสื่อมราคา";
}
//-------------------------------------

$strSCode = ($sd_code_start != "") ? $sd_code_start : "เลือกทั้งหมด";
$strECode = ($sd_code_end != "") ? $sd_code_end : "เลือกทั้งหมด";
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                    <tr><th colspan="'.$columnAll.'">'.$_REQUEST["titleReport"].' บริษัท อสมท จำกัด (มหาชน)</th></tr>
                    <tr><th colspan="'.$columnAll.'">รหัสรายการ '.$strSCode.' ถึง '.$strECode.'</th></tr>
                        <tr><th colspan="'.$columnAll.'">หน่วยงานที่ใช้สินทรัพย์ : '.$_REQUEST["txts-dc_cost_id"].'</th></tr>
                    <tr><th colspan="'.$columnAll.'" align="left">ค่าใช้จ่ายทางบัญชี : '.$txtShow.'</th></tr>
            </table>
            <table cellspacing="0" cellpadding="3" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                <tr bgcolor="#A5BAD6">
                    <th align="center" nowrap><b>ลำดับที่</b></th>
                    <th align="center" nowrap><b>รหัสสินทรัพย์</b></th>
                    <th align="center" nowrap><b>ชื่อสินทรัพย์</b></th>
                    <th align="center" nowrap><b>หมายเลขสินทรัพย์</b></th>
                    <th align="center" nowrap><b>ใช้ที่หน่วยงาน</b></th>
                    <th align="center" nowrap><b>ค่าใช้จ่ายทางบัญชี</b></th>
                    <th align="center" nowrap><b>วันที่ได้มา</b></th>
                    <th align="center" nowrap><b>ราคาทุน</b></th>
                    <th align="center" nowrap><b>มูลค่าซาก</b></th>
                    <th align="center" nowrap><b>อายุการใช้งาน(ปี)</b></th>
                    <th align="center" nowrap>วันที่เริ่มต้นคิดค่าเสื่อมราคา</th>
                    <th align="center" nowrap>ค่าเสื่อมราคาสะสม</th>
                    <th align="center" nowrap>ราคาตามบัญชี</th>
                </tr>'
        .$strData;
//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str);

function genReportByType($i_is_expense, $sd_code_start, $sd_code_end, $dc_cost_id)
{
    $db 	= new DatabaseServer();
    $date 	= new i_date();
    
    $columnAll = 13;
    $strTypeShow = ($i_is_expense == ASSET_CAL_YES)? "คำนวณค่าเสื่อมราคา" : "ไม่คำนวณค่าเสื่อมราคา";
    $str = "";
    
    //============ gen where ===========
    $arrParam = array();
    $arrParam[] = $i_is_expense;
     $sqlWhere = "";
  
    if ($sd_code_start != "" && $sd_code_end != "")
    {
        $sqlWhere .= " and d.c_code between ? and ? ";
        $arrParam[] = $sd_code_start;
        $arrParam[] = $sd_code_end;
    }
    
    if ($dc_cost_id > 0)
    {
        $sqlWhere .= " and d.dc_cost_id = ? ";
        $arrParam[] = $dc_cost_id;
    }
    //========== end gen where =========
    
    $sql = "select c.c_code as cost_code
                , c.c_name as cost_name
                , d.c_code as sd_code
                , b.c_code as asset_code
                , a.c_name as asset_name
                , a.c_asset_code_old
                , isnull(convert(varchar(10),a.d_receive_date, 120), '') as d_receive_date
                , isnull(b.f_unit_cost, 0) as f_uint_cost
                , isnull(b.c_cost_ruins, 0) as c_cost_ruins
                , b.i_period_year
                , isnull(convert(varchar(10),a.d_depreciate, 120), '') as d_depreciate
                , isnull(a.f_depreciate, 0) as f_depreciate
                , isnull(b.f_unit_cost, 0) - isnull(a.f_depreciate, 0) as acc_cost
            from am_tran_rg_dtl  a
                inner join dc_asset b on a.am_tran_rg_dtl_id=b.am_tran_rg_dtl_id
                inner join dc_cost c on a.dc_cost_id = c.dc_cost_id
                inner join am_tran_rg_hdr d on a.am_tran_rg_hdr_id = d.am_tran_rg_hdr_id
            where  b.i_is_expense=?
                and i_is_audit=1
                {$sqlWhere}
            order by cost_code, sd_code, b.c_code";
    $stmt = $db->QueryParam($sql, $arrParam);
    
    $countItems = 0;
    
    $sumSd_cost = 0;
    $sumSd_ruins = 0;
    $sumSd_depre = 0;
    $sumSd_acc = 0;
    
    $sumCost_cost = 0;
    $sumCost_ruins = 0;
    $sumCost_depre = 0;
    $sumCost_acc = 0;
    
    $sumAll_cost = 0;
    $sumAll_ruins = 0;
    $sumAll_depre = 0;
    $sumAll_acc = 0;
    
    $showRow = 0;
    $tempSdCode = "";
    $tempCostCode = "";
    $tempCostName = "";
    while ($row = $db->Fetch($stmt))
    {
        if ($tempCostCode != $row["cost_code"])
        {
            if ($sumSd_cost > 0)
            {
                $str .= "<tr bgcolor='#E2E8E9'>"
                            ."<td colspan='7' align='right'>รวมรหัสรายการ : {$tempSdCode}</td>"
                            ."<td align='right'>".number_format($sumSd_cost, 2)."</td>"
                            ."<td align='right'>".number_format($sumSd_ruins, 2)."</td>"
                            . "<td colspan='2'>&nbsp</td>"
                            ."<td align='right'>".number_format($sumSd_depre, 2)."</td>"
                            ."<td align='right'>".number_format($sumSd_acc, 2)."</td>"
                        . "</tr>";
                
                $sumSd_cost = 0;
                $sumSd_ruins = 0;
                $sumSd_depre = 0;
                $sumSd_acc = 0;
                $showRow = 0;
            }
            
            if ($sumCost_cost > 0)
            {
                $str .= "<tr bgcolor='#f0f4fa'>"
                            ."<td colspan='7' align='right'>รวมหน่วยงาน : {$tempCostName}</td>"
                            ."<td align='right'>".number_format($sumCost_cost, 2)."</td>"
                            ."<td align='right'>".number_format($sumCost_ruins, 2)."</td>"
                            . "<td colspan='2'>&nbsp</td>"
                            ."<td align='right'>".number_format($sumCost_depre, 2)."</td>"
                            ."<td align='right'>".number_format($sumCost_acc, 2)."</td>"
                        . "</tr>";
                
                $sumCost_cost = 0;
                $sumCost_ruins = 0;
                $sumCost_depre = 0;
                $sumCost_acc = 0;
            }
            
            $str .= "<tr bgcolor='#f0f4fa'>"
                    ."<td colspan='{$columnAll}'>หน่วยงานที่ใช้สินทรัพย์ : {$row["cost_name"]}</td>"
                 ."</tr>";
            $tempCostCode = $row["cost_code"];
            $tempCostName = $row["cost_name"];
        }// end if ($tempCostCode != $row["cost_code"]) 
        
        if ($tempSdCode != $row["sd_code"])
        {
            if ($sumSd_cost > 0)
            {
                $str .= "<tr bgcolor='#E2E8E9'>"
                            ."<td colspan='7' align='right'>รวมรหัสรายการ : {$tempSdCode}</td>"
                            ."<td align='right'>".number_format($sumSd_cost, 2)."</td>"
                            ."<td align='right'>".number_format($sumSd_ruins, 2)."</td>"
                            . "<td colspan='2'>&nbsp</td>"
                            ."<td align='right'>".number_format($sumSd_depre, 2)."</td>"
                            ."<td align='right'>".number_format($sumSd_acc, 2)."</td>"
                        . "</tr>";
                
                $sumSd_cost = 0;
                $sumSd_ruins = 0;
                $sumSd_depre = 0;
                $sumSd_acc = 0;
                $showRow = 0;
            }
            $str .= "<tr bgcolor='#E2E8E9'>"
                    ."<td colspan='{$columnAll}'>รหัสรายการ : {$row["sd_code"]}</td>"
                 ."</tr>";
            $tempSdCode = $row["sd_code"];
        }
        
        
        $countItems++;
        $showRow++;
        $d_receive_date = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : '';
        $d_depreciate = ($row["d_depreciate"] != "")? $date->shot_date_from_db($row["d_depreciate"]) : '';
        $strExpenses = ($i_is_expense == ASSET_CAL_YES)? "<font color='blue'>คำนวณค่าเสื่อมราคา</font>" : "<font color='blue'>ไม่คำนวณค่าเสื่อมราคา</font>";
        $str .= "<tr>"
                    ."<td align='center'>{$showRow}.</td>"
                    ."<td align='center' nowrap>&nbsp;{$row["asset_code"]}</td>"
                    ."<td align='left'>&nbsp;{$row["asset_name"]}</td>"
                    ."<td align='left'>&nbsp;{$row["c_asset_code_old"]}</td>"
                    ."<td align='left'>&nbsp;{$row["cost_name"]}</td>"
                    ."<td align='center'>{$strExpenses}</td>"
                    ."<td align='center' nowrap>&nbsp;{$d_receive_date}</td>"
                    ."<td align='right'>".number_format($row["f_uint_cost"], 2)."</td>"
                    ."<td align='right'>".number_format($row["c_cost_ruins"], 2)."</td>"
                    ."<td align='center'>".number_format($row["i_period_year"],2)."</td>"
                    ."<td align='center' nowrap>&nbsp;{$d_depreciate}</td>"  
                    ."<td align='right'>".number_format($row["f_depreciate"], 2)."</td>"
                    ."<td align='right'>".number_format($row["acc_cost"], 2)."</td>"
                ."</tr>";
                
        $sumSd_cost += $row["f_uint_cost"];
        $sumSd_ruins += $row["c_cost_ruins"];
        $sumSd_depre += $row["f_depreciate"];
        $sumSd_acc += $row["acc_cost"];

        $sumCost_cost += $row["f_uint_cost"];
        $sumCost_ruins += $row["c_cost_ruins"];
        $sumCost_depre += $row["f_depreciate"];
        $sumCost_acc += $row["acc_cost"];

        $sumAll_cost += $row["f_uint_cost"];
        $sumAll_ruins += $row["c_cost_ruins"];
        $sumAll_depre += $row["f_depreciate"];
        $sumAll_acc += $row["acc_cost"];
    }// end while
    
    if ($sumSd_cost > 0)
    {
        $str .= "<tr bgcolor='#E2E8E9'>"
                    ."<td colspan='7' align='right'>รวมรหัสรายการ : {$tempSdCode}</td>"
                    ."<td align='right'>".number_format($sumSd_cost, 2)."</td>"
                    ."<td align='right'>".number_format($sumSd_ruins, 2)."</td>"
                    . "<td colspan='2'>&nbsp</td>"
                    ."<td align='right'>".number_format($sumSd_depre, 2)."</td>"
                    ."<td align='right'>".number_format($sumSd_acc, 2)."</td>"
                . "</tr>";
    }

    if ($sumCost_cost > 0)
    {
        $str .= "<tr bgcolor='#f0f4fa'>"
                    ."<td colspan='7' align='right'>รวมหน่วยงาน : {$tempCostName}</td>"
                    ."<td align='right'>".number_format($sumCost_cost, 2)."</td>"
                    ."<td align='right'>".number_format($sumCost_ruins, 2)."</td>"
                    . "<td colspan='2'>&nbsp</td>"
                    ."<td align='right'>".number_format($sumCost_depre, 2)."</td>"
                    ."<td align='right'>".number_format($sumCost_acc, 2)."</td>"
                . "</tr>";
    }
    
    if ($sumAll_cost > 0)
    {
        $str .= "<tr bgcolor='#E2E8E9'>"
                    ."<td colspan='7' align='right'>รวมค่าใช้จ่ายทางบัญชี : {$strTypeShow}</td>"
                    ."<td align='right'>".number_format($sumAll_cost, 2)."</td>"
                    ."<td align='right'>".number_format($sumAll_ruins, 2)."</td>"
                    . "<td colspan='2'>&nbsp</td>"
                    ."<td align='right'>".number_format($sumAll_depre, 2)."</td>"
                    ."<td align='right'>".number_format($sumAll_acc, 2)."</td>"
                . "</tr>";
        $str = "<tr bgcolor='#f0f4fa'><td colspan='{$columnAll}'><u>{$strTypeShow}</u></td></tr>".$str;
    }

    return $str;
}
?>