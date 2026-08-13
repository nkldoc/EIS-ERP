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
$dc_cost_id = $_REQUEST["dc_cost_id"];
$d_begin = (!empty($_REQUEST["d_begin"]))? $date->bc_to_ad($_REQUEST["d_begin"]) : null;
$d_end = (!empty($_REQUEST["d_end"]))? $date->bc_to_ad($_REQUEST["d_end"]) : null;
//===========================================
$arrParam[] = $d_begin;
$arrParam[] = $d_end;

$sqlWhere = "";
if ($asset_group != "")
{
    $sqlWhere .= " and c.c_code like ?";
    $arrParam[] = "{$asset_group}%";
}
    
if ($dc_cost_id > 0)
{
    $sqlWhere .= " and c.dc_cost_id = ?";
    $arrParam[] = $dc_cost_id;
}

$sql = "select left(c.c_code, 2) as group_code
            , d.c_name as group_name
            , e.c_code as cost_code
            , e.c_name as cost_name
            , isnull(convert(varchar(10), a.d_doc_date, 120), '') as d_doc_date
            , c.c_code as asset_code
            , b.c_name as asset_name
            , b.c_serial
            , b.c_brand
            , b.c_model
            , b.c_type
            , c.f_quan
            , c.f_unit_cost
            , case c.i_enable when 1 then 'ใช้งาน' else '<font color=red>ตัดจำหน่าย</font>' end as str_status
        from am_tran_rg_hdr a 
            inner join am_tran_rg_dtl b on a.am_tran_rg_hdr_id=b.am_tran_rg_hdr_id
            inner join dc_asset c on b.am_tran_rg_dtl_id=c.am_tran_rg_dtl_id  
            inner join dc_asset_type d on left(c.c_code, 2) = d.c_code
            inner join dc_cost e on c.dc_cost_id = e.dc_cost_id
        where a.d_doc_date between convert(datetime,?,102) and convert(datetime,?,102)
            {$sqlWhere}
        order by group_code, cost_code, asset_code";
//echo $sqlWhere ; print_r($arrParam);exit;
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";
$countAllItmes = 0;
$countItems = 0;

$sumCost_cost = 0;
$sumInv_cost = 0;
$sumAll_cost = 0;

$tempCostCode = "";
$tempCostName = "";

$tempInvCode = "";
$tempInvName = "";

while ($row = $db->Fetch($stmt))
{
    if ($tempInvCode != $row["group_code"])
    {
        if ($sumCost_cost> 0)
        {
            $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='right' colspan='9'>ยอดรวมหน่วยงาน {$tempCostCode}: {$tempCostName}</td>"
                ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
                ."<td align='left'>&nbsp;</td>"
            ."</tr>";

            $sumCost_cost = 0;
            
            $countItems = 0;
            $tempCostCode = "";
            $tempCostName = "";
        }

        if ($sumInv_cost > 0)
        {
            $str .= "<tr bgcolor='#C6D2D1'>"
                        ."<td align='right' colspan='9'>ยอดรวมหมวดสินทรัพย์ {$tempInvCode}: {$tempInvName}</td>"
                        ."<td align='right' >".number_format($sumInv_cost,2)."</td>"
                        ."<td align='left'>&nbsp;</td>"
                    ."</tr>";

            $sumInv_cost = 0;
        }

        $str .= "<tr bgcolor='#C6D2D1'>"
                ."<td align='left' colspan='11'>{$row["group_code"]} {$row["group_name"]}</td>"
                ."</tr>";

        $tempInvCode = $row["group_code"];
        $tempInvName = $row["group_name"];

    }
    
    if ($tempCostCode != $row["cost_code"])
    {

        if ($sumCost_cost> 0)
        {
            $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='right' colspan='9'>ยอดรวมหน่วยงาน {$tempCostCode}: {$tempCostName}</td>"
                ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
                ."<td align='left'>&nbsp;</td>"
            ."</tr>";

            $sumCost_cost = 0;
            
            $countItems = 0;
            $tempCostCode = "";
            $tempCostName = "";
        }

        $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='left' colspan='11'>{$row["cost_code"]} {$row["cost_name"]}</td>"
                ."</tr>";

        $tempCostCode = $row["cost_code"];
        $tempCostName = $row["cost_name"];

    }

    $countItems++;
    $countAllItmes++;
    $d_doc_date = ($row["d_doc_date"] != "")? $date->shot_date_from_db($row["d_doc_date"]) : '';
    $str .= "<tr>"
                ."<td align='center'>{$countItems}.</td>"
                ."<td align='center' nowrap>&nbsp;{$d_doc_date}</td>"
                ."<td align='center'>&nbsp;{$row["asset_code"]}</td>"
                ."<td align='left'>&nbsp;{$row["asset_name"]}</td>"
                ."<td align='left'>&nbsp;{$row["c_serial"]}</td>"
                ."<td align='left'>&nbsp;{$row["c_brand"]}</td>"
                ."<td align='left'>&nbsp;{$row["c_model"]}</td>"
                ."<td align='left'>&nbsp;{$row["c_type"]}</td>"
                ."<td align='center'>&nbsp;{$row["f_quan"]}</td>"
                ."<td align='right'  nowrap>".number_format($row["f_unit_cost"],2)."</td>"
                ."<td align='center' nowrap>{$row["str_status"]}</td>"
        ."</tr>";

    $sumCost_cost += $row["f_unit_cost"];
    $sumInv_cost += $row["f_unit_cost"];
    $sumAll_cost += $row["f_unit_cost"];
}// end while
if ($sumCost_cost> 0)
{
    $str .= "<tr bgcolor='#f0f4fa'>"
        ."<td align='right' colspan='9'>ยอดรวมหน่วยงาน {$tempCostCode}: {$tempCostName}</td>"
        ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
        ."<td align='left'>&nbsp;</td>"
    ."</tr>";
}

if ($sumInv_cost > 0)
{
    $str .= "<tr bgcolor='#C6D2D1'>"
                ."<td align='right' colspan='9'>ยอดรวมหมวดสินทรัพย์ {$tempInvCode}: {$tempInvName}</td>"
                ."<td align='right' >".number_format($sumInv_cost,2)."</td>"
                ."<td align='left'>&nbsp;</td>"
            ."</tr>";
}

if ($sumAll_cost > 0)
{
	$str .= "<tr bgcolor='#E2E8E9'>"
                ."<td align='right' colspan='9'>รวมทั้งหมด</td>"
                ."<td align='right' >".number_format($sumAll_cost,2)."</td>"
                ."<td align='left'>&nbsp;</td>"
            ."</tr>";
}
$str .= "<tr bgcolor='#E2E8E9'>"
            ."<td align='left' colspan='11'>รวมทั้งหมด {$countAllItmes} รายการ</td>"
        ."</tr>";
$str .= "</table>";

//-------------------------------------
$strDateBetween = $date->shot_date_from_db($d_begin). " ถึง  " .$date->shot_date_from_db($d_end);

$costName = ($dc_cost_id > 0)? $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where dc_cost_id = ?", array($dc_cost_id)) : "ทุกหน่วยงาน";

if ($asset_group != "")
    $invName = $db->GetDataBySQL ("select c_code+' '+c_name from dc_asset_type where c_code = ?", array($asset_group));
else
    $invName = "เลือกทั้งหมด";
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="11">บริษัท อสมท จำกัด (มหาชน)</th></tr>
                        <tr><th colspan="11">'.$_REQUEST["titleReport"].'</th></tr>
                        <tr><th colspan="11">หมวดสินทรัพย์ :  '.$invName.'</th></tr>    
			<tr><th colspan="11">ตั้งแต่วันที่ '.$strDateBetween.'</th></tr>
			<tr><td colspan="11" align="left"><b>หน่วยงาน :</b> '.$costName.'</td></tr>
                        <tr><td colspan="11" align="right">หน่วย : บาท</td></tr>
		</table>
		<table cellspacing="0" cellpadding="3" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                    <tr bgcolor="#A5BAD6">
                        <th align="center" nowrap><b>ลำดับที่</b></th>
                        <th align="center" nowrap><b>วันที่ลงทะเบียน</b></th>
                        <th align="center" nowrap><b>หมายเลขครุภัณฑ์</b></th>
                        <th align="center" nowrap><b>รายการ</b></th>
                        <th align="center" nowrap><b>หมายเลขเครื่อง</b></th>
                        <th align="center" nowrap><b>ยี่ห้อ</b></th>
                        <th align="center" nowrap><b>รุ่น</b></th>
                        <th align="center"><b>แบบ</b></th>
                        <th align="center"><b>จำนวน</b></th>
                        <th align="center"><b>ราคาต่อหน่วย</b></th>
                        <th align="center"><b>สถานะใช้งาน</b></th>
                    </tr>
'.$str;
//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str);
?>