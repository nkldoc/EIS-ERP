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
$d_begin = $_REQUEST["d_begin"];
$d_end = $_REQUEST["d_end"];
$i_month = $_REQUEST["i_month"];
$i_year = $_REQUEST["i_year"];
$i_expire = $_REQUEST["i_expire"];
$i_enable = $_REQUEST["i_enable"];
//===========================================
$inv_code = "";
$d_begin = (!empty($_REQUEST["d_begin"]))? $date->bc_to_ad($_REQUEST["d_begin"]) : null;
$d_end = (!empty($_REQUEST["d_end"]))? $date->bc_to_ad($_REQUEST["d_end"]) : null;
$c_yyyy_mm = sprintf("%04d%02d", $i_year, $i_month);

$arrParam[] = $c_yyyy_mm;
$arrParam[] = $d_begin;
$arrParam[] = $d_end;
$arrParam[] = $i_enable;

$sqlWhere = "";
if ($asset_type != "")
{
    $sqlWhere .= " and c.c_code like ?";
    $arrParam[] = "{$asset_type}%";
}
else if ($asset_group != "")
{
    $sqlWhere .= " and c.c_code like ?";
    $arrParam[] = "{$asset_group}%";
}
    
if ($dc_cost_id > 0)
{
    $sqlWhere .= " and d.dc_cost_id = ?";
    $arrParam[] = $dc_cost_id;
}

if($i_expire == 1){
    $sqlWhere .= "and (isnull(b.c_cost_asset,0) - isnull(b.f_depreciate,0)) <= b.c_cost_ruins";
}elseif($i_expire == 2){
    $sqlWhere .= "and (isnull(b.c_cost_asset,0) - isnull(b.f_depreciate,0)) > b.c_cost_ruins";
}

$sql = "declare @c_yyyy_mm as varchar(6);
        declare @d_start as varchar(10);
        declare @d_end as varchar(10);
        declare @status_tb as tinyint;

        set @c_yyyy_mm = ?;
        set @d_start = ?;
        set @d_end = ?;
        set @status_tb = ?;

        select d.c_code as cost_code
                , d.c_name as cost_name
                , left(c.c_code, 4) as asset_type_code
                , (select c_name from dc_asset_type where c_code = left(c.c_code, 4)) as asset_type_name
                , c.dc_asset_id
                , c.c_code as asset_code
                , b.c_name as asset_name
                , isnull(b.c_asset_code_old, '-') as asset_code_old
                , case when left(c.c_code, 2) = '01' then isnull(b.p_area, '-') else isnull(b.c_brand, '-') end as col1
                , case when left(c.c_code, 2) = '01' then isnull(b.p_deed, '-') else isnull(b.c_serial, '-') end as col2
                , case when left(c.c_code, 2) = '01' then isnull(b.p_num_area, '-') else isnull(b.c_model, '-') end as col3
                , isnull(convert(varchar(10), b.d_receive_date, 120), '') as d_receive_date
                , isnull(b.c_cost_asset,0.00) as c_cost_asset
                , isnull((select top 1 f_depreciate_bal from gl_asset_depre 
                                        where dc_asset_id = c.dc_asset_id and right(c_yyyy_mm, 6) <= @c_yyyy_mm
                                        order by c_yyyy_mm desc), isnull(b.f_depreciate,0.00)) as f_depre
                , isnull(b.c_comment,'') as c_comment
        from am_tran_rg_hdr a
                inner join am_tran_rg_dtl b on a.am_tran_rg_hdr_id = b.am_tran_rg_hdr_id
                inner join dc_asset c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
                inner join dc_cost d on case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end = d.dc_cost_id
        where b.i_is_success = '1'
                and case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end is not null 
                and case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end !='0' 
                and (b.d_register_date between convert(datetime,@d_start,102) and convert(datetime,@d_end,102) or b.d_register_date is null)
                and case when c.bt_date is not null then 2 else 1 end = @status_tb
                {$sqlWhere}
        order by cost_code, asset_type_code, asset_code";
//echo $sqlWhere ; print_r($arrParam);exit;
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";
$countItems = 0;

$sumInv_cost = 0;
$sumInv_depre = 0;
$sumInv_acc = 0;

$sumCost_cost = 0;
$sumCost_depre = 0;
$sumCost_acc = 0;

$sumAll_cost = 0;
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
                    ."<td align='right' colspan='10'>รวม {$tempInvCode}: {$tempInvName}</td>"
                    ."<td align='right' >".number_format($sumInv_cost,2)."</td>"
                    ."<td align='right' >".number_format($sumInv_depre,2)."</td>"
                    ."<td align='right' >".number_format($sumInv_acc,2)."</td>"
                    ."<td align='left'>&nbsp;</td>"
                ."</tr>";

            $sumInv_cost = 0;
            $sumInv_depre = 0;
            $sumInv_acc = 0;

            $countItems = 0;
            $tempInvCode = "";
            $tempInvName = "";
        }

        if ($sumCost_cost > 0)
        {
            $str .= "<tr bgcolor='#C6D2D1'>"
                    ."<td align='right' colspan='10'>รวม {$tempCostCode}: {$tempCostName}</td>"
                    ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
                    ."<td align='right' >".number_format($sumCost_depre,2)."</td>"
                    ."<td align='right' >".number_format($sumCost_acc,2)."</td>"
                    ."<td align='left'>&nbsp;</td>"
                ."</tr>";

            $sumCost_cost = 0;
            $sumCost_depre = 0;
            $sumCost_acc = 0;
        }

        $str .= "<tr bgcolor='#C6D2D1'>"
                ."<td align='left' colspan='14'>{$row["cost_code"]} {$row["cost_name"]}</td>"
                ."</tr>";

        $tempCostCode = $row["cost_code"];
        $tempCostName = $row["cost_name"];

    }

    if ($tempInvCode != $row["asset_type_code"])
    {

        if ($sumInv_cost > 0)
        {
            $str .= "<tr bgcolor='#f0f4fa'>"
                    ."<td align='right' colspan='10'>รวม {$tempInvCode}: {$tempInvName}</td>"
                    ."<td align='right' >".number_format($sumInv_cost,2)."</td>"
                    ."<td align='right' >".number_format($sumInv_depre,2)."</td>"
                    ."<td align='right' >".number_format($sumInv_acc,2)."</td>"
                    ."<td align='left'>&nbsp;</td>"
                ."</tr>";

            $sumInv_cost = 0;
            $sumInv_depre = 0;
            $sumInv_acc = 0;

            $countItems = 0;
            $tempInvCode = "";
            $tempInvName = "";
        }

        $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='left' colspan='14'>{$row["asset_type_code"]} {$row["asset_type_name"]}</td>"
                ."</tr>";

        $tempInvCode = $row["asset_type_code"];
        $tempInvName = $row["asset_type_name"];

    }

    $countItems++;
    $d_receive_date = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : '';
    $f_acc_cost = $row["c_cost_asset"]-$row["f_depre"];
    $str .= "<tr>"
                ."<td align='center'>{$countItems}.</td>"
                ."<td align='center'>&nbsp;{$row["asset_code"]}</td>"
                ."<td align='left'>&nbsp;{$row["asset_name"]}</td>"
                ."<td align='left'>&nbsp;{$row["asset_code_old"]}</td>"
                ."<td align='center'>&nbsp;{$row["col1"]}</td>"
                ."<td align='center'>&nbsp;{$row["col2"]}</td>"
                ."<td align='center'>&nbsp;{$row["col3"]}</td>"
                ."<td align='center'>&nbsp;{$row["cost_code"]}</td>"
                ."<td align='center'>&nbsp;{$row["cost_name"]}</td>"
                ."<td align='center'>&nbsp;{$d_receive_date}</td>"
                ."<td align='right' >".number_format($row["c_cost_asset"],2)."</td>"
                ."<td align='right' >".number_format($row["f_depre"],2)."</td>"
                ."<td align='right' >".number_format($f_acc_cost,2)."</td>"
                ."<td align='left'>{$row["c_comment"]}</td>"
        ."</tr>";

    $sumInv_cost += $row["c_cost_asset"];
    $sumInv_depre += $row["f_depre"];
    $sumInv_acc += $f_acc_cost;

    $sumCost_cost += $row["c_cost_asset"];
    $sumCost_depre += $row["f_depre"];
    $sumCost_acc += $f_acc_cost;

    $sumAll_cost += $row["c_cost_asset"];
    $sumAll_depre += $row["f_depre"];
    $sumAll_acc += $f_acc_cost;
}// end while
if ($sumInv_cost > 0)
{
    $str .= "<tr bgcolor='#f0f4fa'>"
            ."<td align='right' colspan='10'>รวม {$tempInvCode}: {$tempInvName}</td>"
            ."<td align='right' >".number_format($sumInv_cost,2)."</td>"
            ."<td align='right' >".number_format($sumInv_depre,2)."</td>"
            ."<td align='right' >".number_format($sumInv_acc,2)."</td>"
            ."<td align='left'>&nbsp;</td>"
        ."</tr>";
}

if ($sumCost_cost > 0)
{
    $str .= "<tr bgcolor='#C6D2D1'>"
            ."<td align='right' colspan='10'>รวม {$tempCostCode}: {$tempCostName}</td>"
            ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
            ."<td align='right' >".number_format($sumCost_depre,2)."</td>"
            ."<td align='right' >".number_format($sumCost_acc,2)."</td>"
            ."<td align='left'>&nbsp;</td>"
        ."</tr>";
}

if ($sumAll_cost > 0)
{
	$str .= "<tr bgcolor='#E2E8E9'>"
            ."<td align='right' colspan='10'>รวมทั้งหมด</td>"
            ."<td align='right' >".number_format($sumAll_cost,2)."</td>"
            ."<td align='right' >".number_format($sumAll_depre,2)."</td>"
            ."<td align='right' >".number_format($sumAll_acc,2)."</td>"
            ."<td align='left'>&nbsp;</td>"
            ."</tr>";
}

$str .= "</table>";

//-------------------------------------
$strDateBetween = $date->shot_date_from_db($d_begin). " ถึง  " .$date->shot_date_from_db($d_end);

$last_day = date("t", mktime(0, 0, 0, $i_month, 1, $i_year));
$i_month = sprintf("%02d", $i_month);
$depreAt = $last_day." ".$date->l_month_thai[$i_month]." ".($i_year+543);
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="14">'.$_REQUEST["titleReport"].'</th></tr>
			<tr><th colspan="14">วันที่ขึ้นทะเบียนตั้งแต่วันที่  : '.$strDateBetween.'</th></tr>
			<tr><th colspan="14">ค่าเสื่อมราคา ณ วันที่  : '.$depreAt.'</th></tr>
		</table>
		<table cellspacing="0" cellpadding="0" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                    <tr bgcolor="#A5BAD6">
                        <th align="center"><b>ลำดับที่</b></th>
                        <th align="center"><b>รหัสสินทรัพย์</b></th>
                        <th align="center"><b>ชื่อสินทรัพย์</b></th>
                        <th align="center"><b>หมายเลขสินทรัพย์(เก่า)</b></th>
                        <th align="center"><b>ยี่ห้อ/จำนวนเนื้อที่</b></th>
                        <th align="center"><b>Serial NO/เลขที่โฉนด</b></th>
                        <th align="center"><b>แบบ/เลขที่ นส.3ก</b></th>
                        <th align="center"><b>รหัสหน่วยงาน</b></th>
                        <th align="center"><b>หน่วยงาน</b></th>
                        <th align="center"><b>วันที่ได้มา</b></th>
                        <th align="center"><b>ราคาทุน </b></th>
                        <th align="center"><b>ค่าเสื่อมราคาสะสม</b></th>
                        <th align="center"><b>ราคาตามบัญชี</b></th>
                        <th align="center"><b>หมายเหตุ</b></th>
                    </tr>
'.$str;
//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str);
?>