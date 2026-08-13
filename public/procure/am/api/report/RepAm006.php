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
$i_month = $_REQUEST["i_month"];
$i_year = $_REQUEST["i_year"];
$i_expire = $_REQUEST["i_expire"];
$i_enable = $_REQUEST["i_enable"];
//===========================================
$inv_code = "";
$c_yyyy_mm = sprintf("%04d%02d", $i_year, $i_month);

$arrParam[] = $c_yyyy_mm;
$arrParam[] = $i_enable;

$sqlWhere = "";
if ($asset_group != "")
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
        declare @status_tb as tinyint;

        set @c_yyyy_mm = ?;
        set @status_tb = ?;

        select a.asset_type_code, b.c_name as asset_type_name, sum(c_cost_asset) as c_cost_asset, sum(f_depre) as f_depre
        from 
        (select  left(c.c_code, 4) as asset_type_code
                , isnull(b.c_cost_asset,0.00) as c_cost_asset
                , isnull((select top 1 f_depreciate_bal from gl_asset_depre 
                                        where dc_asset_id = c.dc_asset_id and right(c_yyyy_mm, 6) <= @c_yyyy_mm
                                        order by c_yyyy_mm desc), isnull(b.f_depreciate,0.00)) as f_depre
        from am_tran_rg_hdr a
                inner join am_tran_rg_dtl b on a.am_tran_rg_hdr_id = b.am_tran_rg_hdr_id
                inner join dc_asset c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
                inner join dc_cost d on case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end = d.dc_cost_id
        where b.i_is_success = '1'
                and case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end is not null 
                and case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end !='0' 
                and cast(year(a.d_doc_date) as varchar)+ right('0'+cast(month(a.d_doc_date) as varchar), 2) <= @c_yyyy_mm
                and case when c.bt_date is not null then 2 else 1 end = @status_tb
                {$sqlWhere}
        ) a
            inner join dc_asset_type b on a.asset_type_code = b.c_code
        group by a.asset_type_code, b.c_name
        order by a.asset_type_code";
//echo $sqlWhere ; print_r($arrParam);exit;
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";
$sumAll_cost = 0;
$sumAll_depre = 0;
$sumAll_acc = 0;

while ($row = $db->Fetch($stmt))
{
    $f_acc_cost = $row["c_cost_asset"]-$row["f_depre"];
    $str .= "<tr>"
                ."<td align='left'>&nbsp;{$row["asset_type_code"]} {$row["asset_type_name"]}</td>"
                ."<td align='right' >".number_format($row["c_cost_asset"],2)."</td>"
                ."<td align='right' >".number_format($row["f_depre"],2)."</td>"
                ."<td align='right' >".number_format($f_acc_cost,2)."</td>"
        ."</tr>";

    $sumAll_cost += $row["c_cost_asset"];
    $sumAll_depre += $row["f_depre"];
    $sumAll_acc += $f_acc_cost;
}// end while
if ($sumAll_cost > 0)
{
	$str .= "<tr bgcolor='#A5BAD6'>"
            ."<td align='right'>รวมทั้งหมด</td>"
            ."<td align='right' >".number_format($sumAll_cost,2)."</td>"
            ."<td align='right' >".number_format($sumAll_depre,2)."</td>"
            ."<td align='right' >".number_format($sumAll_acc,2)."</td>"
            ."</tr>";
}

$str .= "</table>";

//-------------------------------------
$asset_group_name = ($asset_group != "")? $db->GetDataBySQL("select c_code+' '+c_name from dc_asset_type where c_code = ?", array($asset_group)): "ทั้งหมด";

$last_day = date("t", mktime(0, 0, 0, $i_month, 1, $i_year));
$i_month = sprintf("%02d", $i_month);
$depreAt = $last_day." ".$date->l_month_thai[$i_month]." ".($i_year+543);
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="4">'.$_REQUEST["titleReport"].'</th></tr>
			<tr><th colspan="4">หมวดสินทรัพย์  : '.$asset_group_name.'</th></tr>
			<tr><th colspan="4">ค่าเสื่อมราคา ณ วันที่  : '.$depreAt.'</th></tr>
		</table>
		<table cellspacing="0" cellpadding="0" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                    <tr bgcolor="#A5BAD6">
                        <th align="center"><b>รายการสินทรัพย์</b></th>
                        <th align="center"><b>ราคาทุน </b></th>
                        <th align="center"><b>ค่าเสื่อมราคาสะสม</b></th>
                        <th align="center"><b>ราคาตามบัญชี</b></th>
                    </tr>
'.$str;
//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str);
?>