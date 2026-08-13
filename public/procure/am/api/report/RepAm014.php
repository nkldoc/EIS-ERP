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
$dc_cost_id = $_REQUEST["dc_cost_id"];
$d_begin = (!empty($_REQUEST["d_begin"]))? $date->bc_to_ad($_REQUEST["d_begin"]) : null;
$d_end = (!empty($_REQUEST["d_end"]))? $date->bc_to_ad($_REQUEST["d_end"]) : null;
//===========================================
$arrParam[] = $d_begin;
$arrParam[] = $d_end;

$sqlWhere = "";
if ($dc_cost_id > 0)
{
    $sqlWhere .= " and a.dc_cost_id = ?";
    $arrParam[] = $dc_cost_id;
}

$sql = "select d.c_code as cost_code
                , d.c_name as cost_name
                , a.c_code_gen
                , a.c_code as ccode
                , isnull(convert(varchar(10), a.d_doc_date, 120), '')  as d_doc_date
                , c.c_code as asset_code
                , c.c_name as asset_name
                , isnull(b.f_unit_cost,0) as f_unit_cost
                , isnull((select f_depreciate from am_tran_rg_dtl where am_tran_rg_dtl_id = c.am_tran_rg_dtl_id),0) as start_depre
                , isnull((select top 1 f_salv from gl_asset_depre aa 
                                        inner join gl_depre_hdr bb on aa.gl_depre_hdr_id = bb.gl_depre_hdr_id 
                                where dc_asset_id = c.dc_asset_id and bb.i_enable = 1
                                        and cast(bb.c_yyyy_mm as varchar) < cast(year(a.d_date_chg) as varchar)+ right('0'+cast(month(a.d_date_chg) as varchar), 2) 
                                order by bb.c_yyyy_mm desc, aa.gl_asset_depre_id desc),0) as cal_depre
               , a.c_comment
        from am_tf_hdr a 
                inner join am_tf_dtl b on a.am_tf_hdr_id=b.am_tf_hdr_id 
                inner join dc_asset c on b.dc_asset_id=c.dc_asset_id 
                inner join dc_cost d on c.dc_cost_id = d.dc_cost_id
        where  a.c_code_gen like 'BT%' 
                and a.c_code_gen !='BT' 
                and a.c_code_gen not like 'TA%'
                and a.d_doc_date between convert(datetime,? ,102) and convert(datetime,? ,102)
                {$sqlWhere}
        order by cost_code, a.c_code_gen, c.c_code asc";
//echo $sqlWhere ; print_r($arrParam);exit;
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";
$countItems = 0;

$sumCost_cost = 0;
$sumCost_depre = 0;
$sumCost_acc = 0;

$sumAll_cost = 0;
$sumAll_depre = 0;
$sumAll_acc = 0;

$tempCostCode = "";
$tempCostName = "";

while ($row = $db->Fetch($stmt))
{
    if ($tempCostCode != $row["cost_code"])
    {
        if ($sumCost_cost> 0)
        {
            $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='right' colspan='6'>รวมหน่วยงานเจ้าของสินทรัพย์  : {$tempCostCode} {$tempCostName}</td>"
                ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
                ."<td align='right' >".number_format($sumCost_depre,2)."</td>"
                ."<td align='right' >".number_format($sumCost_acc,2)."</td>"
                ."<td align='left'>&nbsp;</td>"
            ."</tr>";

            $sumCost_cost = 0;
            $sumCost_depre = 0;
            $sumCost_acc = 0;
            
            $countItems = 0;
            $tempCostCode = "";
            $tempCostName = "";
        }

        $str .= "<tr bgcolor='#f0f4fa'>"
                ."<td align='left' colspan='10'>หน่วยงานเจ้าของสินทรัพย์ : {$row["cost_code"]} {$row["cost_name"]}</td>"
                ."</tr>";

        $tempCostCode = $row["cost_code"];
        $tempCostName = $row["cost_name"];

    }

    $countItems++;
    $d_doc_date = ($row["d_doc_date"] != "")? $date->shot_date_from_db($row["d_doc_date"]) : '';
    
    if ($row["cal_depre"] > 0)
    {
        $acc = $row["f_unit_cost"] - $row["cal_depre"]; 
        $depre = $row["cal_depre"]; 
    }
    else
    {
        $acc = $row["f_unit_cost"] - $row["start_depre"]; 
        $depre = $row["start_depre"]; 
    }

    $str .= "<tr>"
                ."<td align='center'>{$countItems}.</td>"
                ."<td align='center' nowrap>&nbsp;{$row["c_code_gen"]}</td>"
                ."<td align='center' nowrap>&nbsp;{$row["ccode"]}</td>"
                ."<td align='center' nowrap>&nbsp;{$d_doc_date}</td>"
                ."<td align='center' nowrap>&nbsp;{$row["asset_code"]}</td>"
                ."<td align='left'>&nbsp;{$row["asset_name"]}</td>"
                ."<td align='right'>".number_format($row["f_unit_cost"],2)."</td>"
                ."<td align='right'>".number_format($depre,2)."</td>"
                ."<td align='right'>".number_format($acc,2)."</td>"
                ."<td align='left'>{$row["c_comment"]}</td>"
        ."</tr>";

    $sumCost_cost += $row["f_unit_cost"];
    $sumCost_depre += $depre;
    $sumCost_acc += $acc;
    
    $sumAll_cost += $row["f_unit_cost"];
    $sumAll_depre += $depre;
    $sumAll_acc += $acc;
}// end while
if ($sumCost_cost> 0)
{
    $str .= "<tr bgcolor='#f0f4fa'>"
        ."<td align='right' colspan='6'>รวมหน่วยงานเจ้าของสินทรัพย์ : {$tempCostCode} {$tempCostName}</td>"
        ."<td align='right' >".number_format($sumCost_cost,2)."</td>"
        ."<td align='right' >".number_format($sumCost_depre,2)."</td>"
        ."<td align='right' >".number_format($sumCost_acc,2)."</td>"
        ."<td align='left'>&nbsp;</td>"
    ."</tr>";
}

if ($sumAll_cost > 0)
{
	$str .= "<tr bgcolor='#E2E8E9'>"
                ."<td align='right' colspan='6'>รวมทั้งหมด</td>"
                ."<td align='right' >".number_format($sumAll_cost,2)."</td>"
                ."<td align='right' >".number_format($sumAll_depre,2)."</td>"
                ."<td align='right' >".number_format($sumAll_acc,2)."</td>"
                ."<td align='left'>&nbsp;</td>"
            ."</tr>";
}
$str .= "</table>";

//-------------------------------------
$strDateBetween = $date->shot_date_from_db($d_begin). " ถึง  " .$date->shot_date_from_db($d_end);

$costName = ($dc_cost_id > 0)? $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where dc_cost_id = ?", array($dc_cost_id)) : "ทั้งหมด";

$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                        <tr><th colspan="10">'.$_REQUEST["titleReport"].'</th></tr>
                        <tr><th colspan="10"><b>หน่วยงานเจ้าของสินทรัพย์ :</b> '.$costName.'</th></tr>
			<tr><th colspan="10">ตั้งแต่วันที่ '.$strDateBetween.'</th></tr>
                        <tr><td colspan="10" align="right">หน่วย : บาท</td></tr>
		</table>
		<table cellspacing="0" cellpadding="3" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                    <tr bgcolor="#A5BAD6">
                        <th align="center" nowrap><b>ลำดับที่</b></th>
                        <th align="center" nowrap><b>เลขที่ตัดจำหน่าย</b></th>
                        <th align="center" nowrap><b>เลขที่เอกสาร</b></th>
                        <th align="center" nowrap><b>วันที่จำหน่าย</b></th>
                        <th align="center" nowrap><b>รหัสสินทรัพย์</b></th>
                        <th align="center" nowrap><b>รายการสินทรัพย์</b></th>
                        <th align="center" nowrap><b>ราคาทุน</b></th>
                        <th align="center" nowrap><b>ค่าเสื่อมสะสม</b></th>
                        <th align="center" nowrap><b>ราคาตามบัญชี</b></th>
                        <th align="center" nowrap><b>หมายเหตุ</b></th>
                    </tr>
'.$str;
//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str);
?>