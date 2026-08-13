<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();
$db 		= new DatabaseServer();
$date 		= new i_date();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "ค่าใช้จ่ายคณะแพทยศาสตร์วชิรพยาบาล";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$i_year 	= $_REQUEST["year"];
$d_start 	= $_REQUEST["date_start"];
$d_end		= $_REQUEST["date_end"];

$arr_data 	= array();
$arr_header	= array();
$arr_sum_lv4	= array();
$arr_sum_lv3	= array();
$arr_sum_all	= array();

$thead1 = "";
$thead2 = "";
$str_year1 = "ปี ".($i_year+543);
$str_year2 = "เหลื่อมปี ".($i_year+542);

$temp_code_lv4 = "";
$temp_name_lv4 = "";

$temp_code_lv3 = "";
$temp_name_lv3 = "";

$styleLv3 = "style=\"background:#D3DCE3; font-weight: bold\"";
$styleLv4 = "style=\"background:#F4F4F4; font-weight: bold\"";
$style = "style=\"background:#FFFFFF;\"";
$tbody = "";
$strTab = "&nbsp;&nbsp;&nbsp;&nbsp;";

$sql = "
		SET NOCOUNT ON;

		declare @i_year as int;
		declare @d_begin as varchar(10);
		declare @d_end as varchar(10);
		declare @i_year_eng as int;

		set @i_year = ?;
		set @d_begin = ?;
		set @d_end = ?;
		set @i_year_eng = ?;

		declare @tb_money as table (dc_expense_budget_type_id bigint
									, dc_acc_id bigint
									, acc_code varchar(20)
									, i_type_year tinyint
									, f_amount decimal(18, 2));

		/*เงินจาก E-phys*/
		insert into @tb_money
		select b.dc_expense_budget_type_id, d.dc_acc_id, e.c_code, isnull(c.i_type_year, 1), sum(c.f_inv)
		from imp_expense_hdr b
			inner join vw_imp_expense_dtl_items c on b.imp_expense_hdr_id = c.imp_expense_hdr_id
			inner join dc_expense d on c.dc_expense_id = d.dc_expense_id
			inner join dc_acc e on d.dc_acc_id = e.dc_acc_id
		where c.c_budget_year = @i_year and b.i_enable = 1
			and convert(datetime, c.d_pay, 102) between convert(datetime, @d_begin, 102) and convert(datetime, @d_end, 102)
		group by b.dc_expense_budget_type_id, d.dc_acc_id, e.c_code, isnull(c.i_type_year, 1);

		/*เงินจาก Vision Net*/
		insert into @tb_money
		select b.dc_expense_budget_type_id, d.dc_acc_id, e.c_code, isnull(c.i_type_year, 1), sum(c.f_inv)
		from imp_expense_vsn_hdr b
			inner join vw_imp_expense_vsn_dtl_items c on b.imp_expense_vsn_hdr_id = c.imp_expense_vsn_hdr_id
			inner join dc_expense_acc_vsn d on c.dc_expense_acc_vsn_id = d.dc_expense_acc_vsn_id
			inner join dc_acc e on d.dc_acc_id = e.dc_acc_id
		where c.c_budget_year = @i_year_eng and b.i_enable = 1
			and convert(datetime, c.d_doc, 102) between convert(datetime, @d_begin, 102) and convert(datetime, @d_end, 102)
		group by b.dc_expense_budget_type_id, d.dc_acc_id, e.c_code, isnull(c.i_type_year, 1);

		/*sum เงินที่ LV5*/
		select dc_expense_budget_type_id, left(acc_code,9)+'00' as acc_code, i_type_year, sum(f_amount) as f_amount
		from @tb_money
		group by dc_expense_budget_type_id, left(acc_code,9), i_type_year;
		";

$stmt_data = $db->QueryParam($sql, array(($i_year+543), $d_start, $d_end,$i_year));
while ($data = $db->Fetch($stmt_data))
{
    $arr_data[$data["dc_expense_budget_type_id"]][$data["acc_code"]][$data["i_type_year"]] = $data["f_amount"];
}// end while

// gen Head 
$sql_head = "select dc_expense_budget_type_id, c_name 
			from vw_dc_expense_budget_type 
			where i_enable = ?
			order by c_name";
$stmt_h = $db->QueryParam($sql_head, array(STATUS_ENABLE));
while ($data_h = $db->Fetch($stmt_h))
{
    $arr_header[$data_h["dc_expense_budget_type_id"]] = $data_h["c_name"];
	$thead1 .= "<th nowrap style='vertical-align:middle;' colspan='2'>".$data_h["c_name"]."</th>";
	$thead2 .= "<th nowrap style='vertical-align:middle;'>".$str_year1."</th>";
	$thead2 .= "<th nowrap style='vertical-align:middle;'>".$str_year2."</th>";
	
	//เตรียม array สำหรับ SUMMARY
	$arr_sum_lv4[$data_h["dc_expense_budget_type_id"]][1]	= 0;
	$arr_sum_lv4[$data_h["dc_expense_budget_type_id"]][2]	= 0;
	
	$arr_sum_lv3[$data_h["dc_expense_budget_type_id"]][1]	= 0;
	$arr_sum_lv3[$data_h["dc_expense_budget_type_id"]][2]	= 0;
	
	$arr_sum_all[$data_h["dc_expense_budget_type_id"]][1]	= 0;
	$arr_sum_all[$data_h["dc_expense_budget_type_id"]][2]	= 0;
}// end while

$sql_acc = "select left(c_code, 5)+'000000' as acc_code_lv3
				, (select c_name from vw_dc_acc where c_code = left(a.c_code, 5)+'000000') as acc_name_lv3
				, left(c_code, 7)+'0000' as acc_code_lv4
				, (select c_name from vw_dc_acc where c_code = left(a.c_code, 7)+'0000') as acc_name_lv4
				, c_code as acc_code_lv5, c_name as acc_name_lv5
			from vw_dc_acc a
			where i_enable = ? and i_group = ? and i_level = ?
			order by c_code";
			
$stmt = $db->QueryParam($sql_acc, array(STATUS_ENABLE, 5, 5));
while ($fet = $db->Fetch($stmt))
{
	//LV3
	if ($temp_code_lv3 != $fet["acc_code_lv3"]){
		
		//sum ก่อนหน้า
		if ($temp_code_lv3 != ""){
			
			// แสดงผลรวม Lv4
			$tbody	.= "<tr>";
			$tbody	.= "<td nowrap ".$styleLv4." align='right'> รวม ".$temp_code_lv4." ".$temp_name_lv4."</td>";
			
			if (is_array($arr_header)){
				foreach($arr_header as $dc_expense_budget_type_id => $head_name){
					
					// ประจำปี
					if (!empty($arr_sum_lv4[$dc_expense_budget_type_id][1])){
						$amount = $arr_sum_lv4[$dc_expense_budget_type_id][1];
						$tbody	.= "<td nowrap ".$styleLv4." align='right'>".number_format($amount, 2)."</td>";
					} else {
						$tbody	.= "<td nowrap ".$styleLv4." align='right'>-</td>";
					}
					
					// เหลื่อมปี
					if (!empty($arr_sum_lv4[$dc_expense_budget_type_id][2])){
						$amount = $arr_sum_lv4[$dc_expense_budget_type_id][2];
						$tbody	.= "<td nowrap ".$styleLv4." align='right'>".number_format($amount, 2)."</td>";
					} else {
						$tbody	.= "<td nowrap ".$styleLv4." align='right'>-</td>";
					}
					$arr_sum_lv4[$dc_expense_budget_type_id][1] = 0;
					$arr_sum_lv4[$dc_expense_budget_type_id][2] = 0;
				}
			}
			$tbody	.= "</tr>";
			
			// แสดงผลรวม Lv3
			$tbody	.= "<tr>";
			$tbody	.= "<td nowrap ".$styleLv3." align='right'> รวม ".$temp_code_lv3." ".$temp_name_lv3."</td>";
			
			if (is_array($arr_header)){
				foreach($arr_header as $dc_expense_budget_type_id => $head_name){
					
					// ประจำปี
					if (!empty($arr_sum_lv3[$dc_expense_budget_type_id][1])){
						$amount = $arr_sum_lv3[$dc_expense_budget_type_id][1];
						$tbody	.= "<td nowrap ".$styleLv3." align='right'>".number_format($amount, 2)."</td>";
					} else {
						$tbody	.= "<td nowrap ".$styleLv3." align='right'>-</td>";
					}
					
					// เหลื่อมปี
					if (!empty($arr_sum_lv3[$dc_expense_budget_type_id][2])){
						$amount = $arr_sum_lv3[$dc_expense_budget_type_id][2];
						$tbody	.= "<td nowrap ".$styleLv3." align='right'>".number_format($amount, 2)."</td>";
					} else {
						$tbody	.= "<td nowrap ".$styleLv3." align='right'>-</td>";
					}
					
					$arr_sum_lv3[$dc_expense_budget_type_id][1] = 0;
					$arr_sum_lv3[$dc_expense_budget_type_id][2] = 0;
				}
			}
			$tbody	.= "</tr>";
		}//จบ sum ก่อนหน้า
		
		$tbody	.= "<tr>";
		$tbody	.= "<td nowrap ".$styleLv3." align='left'>".$fet["acc_code_lv3"]." ".$fet["acc_name_lv3"]."</td>";
		
		if (is_array($arr_header)){
			foreach($arr_header as $dc_expense_budget_type_id => $head_name){
				
				$tbody	.= "<td nowrap ".$styleLv3." align='right'>&nbsp;</td>";
				$tbody	.= "<td nowrap ".$styleLv3." align='right'>&nbsp;</td>";
			}
		}
		$tbody	.= "</tr>";
		
		$temp_code_lv3 = $fet["acc_code_lv3"];
		$temp_name_lv3 = $fet["acc_name_lv3"];
	}
	
	//LV4
	if ($temp_code_lv4 != $fet["acc_code_lv4"]){
		
		//sum ก่อนหน้า
		if ($temp_code_lv4 != ""){
			
			// แสดงผลรวม Lv4
			$tbody	.= "<tr>";
			$tbody	.= "<td nowrap ".$styleLv4." align='right'> รวม ".$temp_code_lv4." ".$temp_name_lv4."</td>";
			
			if (is_array($arr_header)){
				foreach($arr_header as $dc_expense_budget_type_id => $head_name){
					
					// ประจำปี
					if (!empty($arr_sum_lv4[$dc_expense_budget_type_id][1])){
						$amount = $arr_sum_lv4[$dc_expense_budget_type_id][1];
						$tbody	.= "<td nowrap ".$styleLv4." align='right'>".number_format($amount, 2)."</td>";
					} else {
						$tbody	.= "<td nowrap ".$styleLv4." align='right'>-</td>";
					}
					
					// เหลื่อมปี
					if (!empty($arr_sum_lv4[$dc_expense_budget_type_id][2])){
						$amount = $arr_sum_lv4[$dc_expense_budget_type_id][2];
						$tbody	.= "<td nowrap ".$styleLv4." align='right'>".number_format($amount, 2)."</td>";
					} else {
						$tbody	.= "<td nowrap ".$styleLv4." align='right'>-</td>";
					}
					$arr_sum_lv4[$dc_expense_budget_type_id][1] = 0;
					$arr_sum_lv4[$dc_expense_budget_type_id][2] = 0;
				}
			}
			$tbody	.= "</tr>";
			
		}//จบ sum ก่อนหน้า
		
		$tbody	.= "<tr>";
		$tbody	.= "<td nowrap ".$styleLv4." align='left'>{$strTab}".$fet["acc_code_lv4"]." ".$fet["acc_name_lv4"]."</td>";
		
		if (is_array($arr_header)){
			foreach($arr_header as $dc_expense_budget_type_id => $head_name){
				
				$tbody	.= "<td nowrap ".$styleLv4." align='right'>&nbsp;</td>";
				$tbody	.= "<td nowrap ".$styleLv4." align='right'>&nbsp;</td>";
			}
		}
		$tbody	.= "</tr>";
		
		$temp_code_lv4 = $fet["acc_code_lv4"];
		$temp_name_lv4 = $fet["acc_name_lv4"];
	}
	
	$tbody	.= "<tr>";
	$tbody	.= "<td nowrap ".$style." align='left'>{$strTab}{$strTab}".$fet["acc_code_lv5"]." ".$fet["acc_name_lv5"]."</td>";
	
	if (is_array($arr_header)){
		foreach($arr_header as $dc_expense_budget_type_id => $head_name){
			
			// ประจำปี
			if (!empty($arr_data[$dc_expense_budget_type_id][$fet["acc_code_lv5"]][1])){
				$amount = $arr_data[$dc_expense_budget_type_id][$fet["acc_code_lv5"]][1];
				$tbody	.= "<td nowrap ".$style." align='right'>".number_format($amount, 2)."</td>";
				
				$arr_sum_lv4[$dc_expense_budget_type_id][1] += round($amount, 2);
				$arr_sum_lv3[$dc_expense_budget_type_id][1] += round($amount, 2);
				$arr_sum_all[$dc_expense_budget_type_id][1] += round($amount, 2);
			} else {
				$tbody	.= "<td nowrap ".$style." align='right'>-</td>";
			}
			
			// เหลื่อมปี
			if (!empty($arr_data[$dc_expense_budget_type_id][$fet["acc_code_lv5"]][2])){
				$amount = $arr_data[$dc_expense_budget_type_id][$fet["acc_code_lv5"]][2];
				$tbody	.= "<td nowrap ".$style." align='right'>".number_format($amount, 2)."</td>";
				
				$arr_sum_lv4[$dc_expense_budget_type_id][2] += round($amount, 2);
				$arr_sum_lv3[$dc_expense_budget_type_id][2] += round($amount, 2);
				$arr_sum_all[$dc_expense_budget_type_id][2] += round($amount, 2);
			} else {
				$tbody	.= "<td nowrap ".$style." align='right'>-</td>";
			}
		}
	}
	$tbody	.= "</tr>";
	
}//=============== end while

// แสดงผลรวม Lv4
$tbody	.= "<tr>";
$tbody	.= "<td nowrap ".$styleLv4." align='right'> รวม ".$temp_code_lv4." ".$temp_name_lv4."</td>";

if (is_array($arr_header)){
	foreach($arr_header as $dc_expense_budget_type_id => $head_name){
		
		// ประจำปี
		if (!empty($arr_sum_lv4[$dc_expense_budget_type_id][1])){
			$amount = $arr_sum_lv4[$dc_expense_budget_type_id][1];
			$tbody	.= "<td nowrap ".$styleLv4." align='right'>".number_format($amount, 2)."</td>";
		} else {
			$tbody	.= "<td nowrap ".$styleLv4." align='right'>-</td>";
		}
		
		// เหลื่อมปี
		if (!empty($arr_sum_lv4[$dc_expense_budget_type_id][2])){
			$amount = $arr_sum_lv4[$dc_expense_budget_type_id][2];
			$tbody	.= "<td nowrap ".$styleLv4." align='right'>".number_format($amount, 2)."</td>";
		} else {
			$tbody	.= "<td nowrap ".$styleLv4." align='right'>-</td>";
		}
	}
}
$tbody	.= "</tr>";

// แสดงผลรวม Lv3
$tbody	.= "<tr>";
$tbody	.= "<td nowrap ".$styleLv3." align='right'> รวม ".$temp_code_lv3." ".$temp_name_lv3."</td>";

if (is_array($arr_header)){
	foreach($arr_header as $dc_expense_budget_type_id => $head_name){
		
		// ประจำปี
		if (!empty($arr_sum_lv3[$dc_expense_budget_type_id][1])){
			$amount = $arr_sum_lv3[$dc_expense_budget_type_id][1];
			$tbody	.= "<td nowrap ".$styleLv3." align='right'>".number_format($amount, 2)."</td>";
		} else {
			$tbody	.= "<td nowrap ".$styleLv3." align='right'>-</td>";
		}
		
		// เหลื่อมปี
		if (!empty($arr_sum_lv3[$dc_expense_budget_type_id][2])){
			$amount = $arr_sum_lv3[$dc_expense_budget_type_id][2];
			$tbody	.= "<td nowrap ".$styleLv3." align='right'>".number_format($amount, 2)."</td>";
		} else {
			$tbody	.= "<td nowrap ".$styleLv3." align='right'>-</td>";
		}
	}
}
$tbody	.= "</tr>";

// แสดงผลรวมทั้้งหมด
$tbody	.= "<tr>";
$tbody	.= "<td nowrap ".$styleLv3." align='right'> รวมทั้งหมด</td>";

if (is_array($arr_header)){
	foreach($arr_header as $dc_expense_budget_type_id => $head_name){
		
		// ประจำปี
		if (!empty($arr_sum_all[$dc_expense_budget_type_id][1])){
			$amount = $arr_sum_all[$dc_expense_budget_type_id][1];
			$tbody	.= "<td nowrap ".$styleLv3." align='right'>".number_format($amount, 2)."</td>";
		} else {
			$tbody	.= "<td nowrap ".$styleLv3." align='right'>-</td>";
		}
		
		// เหลื่อมปี
		if (!empty($arr_sum_all[$dc_expense_budget_type_id][2])){
			$amount = $arr_sum_all[$dc_expense_budget_type_id][2];
			$tbody	.= "<td nowrap ".$styleLv3." align='right'>".number_format($amount, 2)."</td>";
		} else {
			$tbody	.= "<td nowrap ".$styleLv3." align='right'>-</td>";
		}
	}
}
$tbody	.= "</tr>";
//====================================================================================
/*$thead[]	= "ที่";
$thead[]	= "รหัสบัญชี";
$thead[]	= "ยอดยกมา เดบิต";
$thead[]	= "ยอดยกมา เครดิต";
$thead[]	= "เดบิต";
$thead[]	= "เครดิต";
$thead[]	= "ยอดยกไป เดบิต";
$thead[]	= "ยอดยกไป เครดิต";

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$style		= "";
		
		// GEN TBODY
		if( $jObj["i_type"] == 2 ) { $style = "style=\"background:#D3DCE3;\""; }
		
		if($jObj["i_type"] == 1) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td nowrap ".$style." align='center'>".$jObj["no"]."</td>";
			$tbody	.= "<td nowrap ".$style.">".$jObj["acc_code"]." ".$jObj["acc_name"]."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_begin_dr"],2)."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_begin_cr"],2)."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_dr"],2)."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_cr"],2)."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_end_dr"],2)."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_end_cr"],2)."</td>";
			$tbody	.=	"</tr>";
		} else if($jObj["i_type"] == 2) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$style." colspan='2' align='right'><b>รวมทั้งหมด</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_begin_dr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_begin_cr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_dr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_cr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_end_dr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_end_cr"],2)."</b></td>";
			$tbody	.=	"</tr>";
			
		}
		
	}
	
	$tbody	.= "</tbody>";

} else {
	$conspan	= 0;
	foreach ($thead AS $ss) { ++$conspan;  }
	$tbody	= "<tbody><tr><td align='center' colspan=".$conspan.">ไม่มีข้อมูล</td></tr></tbody>";
}*/
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?php echo COMPANY_NAME;?></title>
<link  rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>
<body>
<?php
	if( $s_title == true ) echo "<div align=\"center\"><strong>".$title."</strong></div>";

	echo "<div align=\"center\"><strong>".$caption."</strong></div>";
	echo "<div align=\"center\"><strong> ปีงบประมาณ ".($_REQUEST["year"]+543)."</strong></div>";
	echo "<div><strong>ระหว่างวันที่ : <font color='blue'>".$date->extDateBuddha($_REQUEST["date_start"])."</font> ถึงวันที่ : <font color='blue'>".$date->extDateBuddha($_REQUEST["date_end"])."</font></strong></div>";
?>
<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
<thead valign="top">
	<tr>
		<th nowrap style='vertical-align:middle;' rowspan='2'>รายการ</th>
		<?php echo $thead1; ?>
	</tr>
	<tr>
		<?php echo $thead2; ?>
	</tr>
</thead>
<?= $tbody ?>
</table>
</body>
</html>