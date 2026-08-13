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
$i_type = $_REQUEST["i_type"];
$i_budget = $_REQUEST["i_budget"];
$d_begin = (!empty($_REQUEST["d_begin"]))? $date->bc_to_ad($_REQUEST["d_begin"]) : null;
$d_end = (!empty($_REQUEST["d_end"]))? $date->bc_to_ad($_REQUEST["d_end"]) : null;
$ap_po_hdr_id = $_REQUEST["ap_po_hdr_id"];

$arrParam[] = 1;
$arrParam[] = $d_begin;
$arrParam[] = $d_end;
$arrParam[] = $i_budget;
$sqlWhere = "";
if ($i_type > -1)
{
    $sqlWhere .= " and a.i_is_purchase = ?";
    $arrParam[] = $i_type;
}
if ($dc_cost_id > 0)
{
    $sqlWhere .= " and a.dc_cost_id = ?";
    $arrParam[] = $dc_cost_id;
}
if ($ap_po_hdr_id > 0)
{
    $sqlWhere .= " and a.ap_po_hdr_id = ?";
    $arrParam[] = $ap_po_hdr_id;
}

$arrPurchase = array(0=>"จัดจ้าง", 1=>"จัดซื้อ", 2=>"จัดเช่า");

$sql = "SELECT a.ap_po_hdr_id
			, a.c_contract_no
			, a.c_po_no
			, isnull(convert(varchar(10),a.d_doc_date, 120),'') as d_doc_date
			, b.c_name
			, a.i_is_purchase
			, (select c_name from dc_cnt where dc_cnt_id = a.dc_cnt_id) as cnt_name
			, (select c_name from dc_cost where dc_cost_id = a.dc_cost_id) as cost_name
			, case when isnull(a.c_contract_no, '') = '' 
				then (select sum(f_quan*f_unit_cost_vat) from ap_po_dtl where ap_po_hdr_id=a.ap_po_hdr_id)
				else (select sum(f_net_cost) from ap_period_hdr where ap_po_hdr_id=a.ap_po_hdr_id)
				end f_cost
		FROM ap_po_hdr a 
			INNER JOIN ap_period_hdr b ON a.ap_po_hdr_id = b.ap_po_hdr_id 
		where b.i_is_audit = ? 
			and a.d_doc_date between convert(datetime,?,102) and convert(datetime,?,102) 
			and a.dc_bg_type_id = ?
			{$sqlWhere}
		group by a.ap_po_hdr_id, a.c_contract_no, a.c_po_no, a.d_doc_date, b.c_name, a.i_is_purchase,a.dc_cnt_id, a.dc_cost_id
		order by a.c_contract_no,a.c_po_no ASC";
//print_r($arrParam);
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";
$i = 1;
$sum = 0;

while ($row = $db->Fetch($stmt))
{
	$str .= "<tr>"
					."<td align='center'>{$i}.</td>"
					."<td align='center'>&nbsp;{$row["c_contract_no"]}</td>"
					."<td align='center'>&nbsp;{$row["c_po_no"]}</td>"
					."<td align='center'>".$date->shot_date_from_db($row["d_doc_date"])."</td>"
					."<td align='left'>{$row["c_name"]}</td>"
					."<td align='center'>&nbsp;".$arrPurchase[$row["i_is_purchase"]]."</td>"
					."<td align='right' >".number_format($row["f_cost"],2)."</td>"
					."<td align='left'>{$row["cnt_name"]}</td>"
					."<td align='left'>{$row["cost_name"]}</td>"
				."</tr>";
	$sum += $row["f_cost"];
	$i++;
}// end while
$str .= "<tr bgcolor='#E2E8E9'>"
			."<th align='right' colspan='6'>รวม</th>"
			."<th align='right'>".number_format($sum, 2)."</th>"
			."<th align='left' colspan='2'>&nbsp;</th>"
		."</tr>"
		."</table>";

//-------------------------------------
$strDateBetween = $date->shot_date_from_db($d_begin). " ถึง  " .$date->shot_date_from_db($d_end);
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="9">รายงานการจัดซื้อ/จัดจ้างที่ตรวจรับแล้ว</th></tr>
			<tr><th colspan="9">ตั้งแต่วันที่ '.$strDateBetween.'</th></tr>
		</table>
		<table cellspacing="0" cellpadding="0" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr bgcolor="#A5BAD6">
				<th align="center"><b>ลำดับที่</b></th>
				<th align="center"><b>เลขที่สัญญา</b></th>
				<th align="center"><b>เลขที่ใบสั่งซื้อ/สั่งจ้าง</b></th>
				<th align="center"><b>วันที่จัดซื้อ/จัดจ้าง</b></th>
				<th align="center"><b>รายการ</b></th>
				<th align="center"><b>ประเภท</b></th>
				<th align="center"><b>วงเงินจัดซื้อ/จัดจ้าง</b></th>
				<th align="center"><b>ผู้ขาย/ผู้รับจ้าง</b></th>
				<th align="center"><b>หน่วยงาน</b></th>
			</tr>
'.$str;
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str); 			
?>