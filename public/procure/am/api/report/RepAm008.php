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
$txt_cost = $_REQUEST["txts-dc_cost_id"];
//===========================================

$inv_code = "";
$toDay = date("Y-m-d");

$arrParam[] = $dc_cost_id;
$arrParam[] = $toDay;

$sqlWhere = "";
if ($asset_group != "")
{
    $sqlWhere .= " and c.c_code like ?";
    $arrParam[] = "{$asset_group}%";
}

$sql = "declare @dc_cost_id as bigint;
        declare @to_day as varchar(10);

        set @dc_cost_id = ?;
        set @to_day = ?;

        select	left(c.c_code, 2) as group_code
                , (select c_name from dc_asset_type where c_code = left(c.c_code, 2)) as group_name
                , c.c_code as asset_code
                , b.c_name as asset_name
                , isnull(b.c_cost_asset, 0.00) as c_cost_asset
                        , isnull(b.c_cost_ruins, 0.00) as c_cost_ruins
                , isnull((select top 1 f_depreciate_bal from gl_asset_depre 
                            where dc_asset_id = c.dc_asset_id
                            order by c_yyyy_mm desc), isnull(b.f_depreciate,0.00)) as f_depre
        from am_tran_rg_hdr a
                inner join am_tran_rg_dtl b on a.am_tran_rg_hdr_id = b.am_tran_rg_hdr_id
                inner join dc_asset c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
                inner join dc_cost d on case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end = d.dc_cost_id
        where b.i_is_success = '1'
                and case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end is not null 
                and case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end !='0' 
                        and d.dc_cost_id = @dc_cost_id
                and case when convert(datetime,@to_day,102) >= bt_date then 1 else 2 end = 2
                {$sqlWhere}
        order by group_code, asset_code";
//echo $sqlWhere ; print_r($arrParam);exit;
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";
$countItems = 0;

$sumInv_cost = 0;
$sumInv_ruins = 0;
$sumInv_depre = 0;
$sumInv_acc = 0;

$sumAll_cost = 0;
$sumAll_ruins = 0;
$sumAll_depre = 0;
$sumAll_acc = 0;

$tempInvCode = "";
$tempInvName = "";

while ($row = $db->Fetch($stmt))
{
    if ($tempInvCode != $row["group_code"])
    {
        if ($sumInv_cost > 0)
        {
            $str .= "<tr bgcolor='#f0f4fa'>"
                    ."<td align='right' colspan='3'>รวม {$tempInvCode}: {$tempInvName}</td>"
                    ."<td align='right' nowrap>".number_format($sumInv_cost,2)."</td>"
                    ."<td align='right' nowrap>".number_format($sumInv_ruins,2)."</td>"
                    ."<td align='right' nowrap>".number_format($sumInv_depre,2)."</td>"
                    ."<td align='right' nowrap>".number_format($sumInv_acc,2)."</td>"
                ."</tr>";

            $sumInv_cost = 0;
            $sumInv_ruins = 0;
            $sumInv_depre = 0;
            $sumInv_acc = 0;

            $countItems = 0;
        }

        $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='left' colspan='14'>{$row["group_code"]} {$row["group_name"]}</td>"
                ."</tr>";

        $tempInvCode = $row["group_code"];
        $tempInvName = $row["group_name"];

    }

    $countItems++;
    $f_acc_cost = $row["c_cost_asset"]-$row["f_depre"];
    $str .= "<tr>"
                ."<td align='center' nowrap>{$countItems}.</td>"
                ."<td align='center' nowrap>&nbsp;{$row["asset_code"]}</td>"
                ."<td align='left'>&nbsp;{$row["asset_name"]}</td>"
                ."<td align='right' nowrap>".number_format($row["c_cost_asset"],2)."</td>"
                ."<td align='right' nowrap>".number_format($row["c_cost_ruins"],2)."</td>"
                ."<td align='right' nowrap>".number_format($row["f_depre"],2)."</td>"
                ."<td align='right' nowrap>".number_format($f_acc_cost,2)."</td>"
        ."</tr>";

    $sumInv_cost += $row["c_cost_asset"];
    $sumInv_ruins += $row["c_cost_ruins"];
    $sumInv_depre += $row["f_depre"];
    $sumInv_acc += $f_acc_cost;

    $sumAll_cost += $row["c_cost_asset"];
    $sumAll_ruins += $row["c_cost_ruins"];
    $sumAll_depre += $row["f_depre"];
    $sumAll_acc += $f_acc_cost;
}// end while
if ($sumInv_cost > 0)
{
    $str .= "<tr bgcolor='#f0f4fa'>"
            ."<td align='right' colspan='3'>รวม {$tempInvCode}: {$tempInvName}</td>"
            ."<td align='right' nowrap>".number_format($sumInv_cost,2)."</td>"
            ."<td align='right' nowrap>".number_format($sumInv_ruins,2)."</td>"
            ."<td align='right' nowrap>".number_format($sumInv_depre,2)."</td>"
            ."<td align='right' nowrap>".number_format($sumInv_acc,2)."</td>"
        ."</tr>";
}

if ($sumAll_cost > 0)
{
	$str .= "<tr bgcolor='#E2E8E9'>"
            ."<td align='right' colspan='3'>รวมทั้งหมด</td>"
            ."<td align='right' nowrap>".number_format($sumAll_cost,2)."</td>"
            ."<td align='right' nowrap>".number_format($sumAll_ruins,2)."</td>"
            ."<td align='right' nowrap>".number_format($sumAll_depre,2)."</td>"
            ."<td align='right' nowrap>".number_format($sumAll_acc,2)."</td>"
            ."</tr>";
}

$str .= "</table>";

//-------------------------------------
$group_name = ($asset_group != "")? $db->GetDataBySQL("select c_code+' '+c_name from dc_asset_type where c_code = ?", array($asset_group)) : "เลือกทั้งหมด";
$i_month = sprintf("%02d", date('m'));
$depreAt = date('d')." ".$date->l_month_thai[$i_month]." ".(date('Y')+543);
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="7">'.$_REQUEST["titleReport"].'</th></tr>
			<tr><th colspan="7">ณ วันที่  : '.$depreAt.'</th></tr>
                        <tr><th colspan="7">หน่วยงานที่ใช้สินทรัพย์  : '.$txt_cost.'</th></tr>
			<tr><th colspan="7">หมวดสินทรัพย์ : '.$group_name.'</th></tr>
		</table>
		<table cellspacing="0" cellpadding="0" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                    <tr bgcolor="#A5BAD6">
                        <th align="center" nowrap><b>ลำดับที่</b></th>
                        <th align="center" nowrap><b>รหัสสินทรัพย์</b></th>
                        <th align="center" nowrap><b>ชื่อสินทรัพย์</b></th>
                        <th align="center" nowrap><b>ราคาทุน </b></th>
                        <th align="center" nowrap><b>มูลค่าซาก</b></th>
                        <th align="center" nowrap><b>ค่าเสื่อมราคาสะสม</b></th>
                        <th align="center" nowrap><b>ราคาตามบัญชี</b></th>
                    </tr>
'.$str;
//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str);
?>