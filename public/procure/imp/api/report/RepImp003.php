<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/date/i_date.class.php");
include("../../../lib/export/exportUtil.php");

###################
$export = new exportUtil ();
$db 	= new DatabaseServer();
$date 	= new i_date();
$titleReport = 'รายงานการรับเงินประจำวัน ตามผังบัญชี';
########################################################################## 

if ($_REQUEST ["mode"] == "excel") {
	$export->headerExcel ( $titleReport );
}

//iSearch
//$date->bc_to_ad($_REQUEST["d_doc_date"]);
$date_start = $_REQUEST["date_start"];
$date_end = $_REQUEST["date_end"];

$con = "";

$for_id = explode ( ";", $_REQUEST ["dc_period_id"] );
$con = "";
$con_period = "";

if (! in_array ( "0", $for_id )) {
	$in = "";
	if (is_array ( $for_id )) {
		foreach ( $for_id as $val ) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
		$con_period .= ($in != "") ? " AND a.dc_period_id IN (" . $in . ")" : "";
	}
}

if ($_REQUEST ["i_show_acc"] == 1) {
	$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent"] );
	
	if (! in_array ( "0", $for_id )) {
		$in = "";
		if (is_array ( $for_id )) {
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " where dc_acc_lv5_id IN (" . $in . ")" : "";
		}
	}
	
	$sql = "select d.c_code_lv5 as c_code, d.c_name_lv5 as c_name
				, sum(c.f_dr) as f_dr, sum(c.f_cr) as f_cr
			from imp_receive_hdr a
				inner join gl_tran_hdr b on a.c_gx_code = b.c_code
				inner join gl_tran_dtl c on b.gl_tran_hdr_id = c.gl_tran_hdr_id
				inner join vw_dc_acc_with_parent d on c.dc_acc_id = d.dc_acc_id
			where a.i_enable = ".STATUS_ENABLE." {$con_period}
				and convert(datetime,a.d_doc_date, 102) between convert(datetime, ?, 102) and convert(datetime, ?, 102)
				and (d.i_group = 1 or d.dc_acc_id in (select dc_acc_id from vw_dc_acc_with_parent {$con}))
				and b.i_is_post>1 and b.i_enable = 1 
			group by d.c_code_lv5, d.c_name_lv5 
			order by d.c_code_lv5";
} else {
	$for_id = explode ( ";", $_REQUEST ["dc_acc_id"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		if (is_array ( $for_id )) {
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " where dc_acc_id IN (" . $in . ")" : "";
		}
	}
	
	$sql = "select d.c_code, d.c_name
				, sum(c.f_dr) as f_dr, sum(c.f_cr) as f_cr
			from imp_receive_hdr a
				inner join gl_tran_hdr b on a.c_gx_code = b.c_code
				inner join gl_tran_dtl c on b.gl_tran_hdr_id = c.gl_tran_hdr_id
				inner join vw_dc_acc_with_parent d on c.dc_acc_id = d.dc_acc_id
			where a.i_enable = ".STATUS_ENABLE." {$con_period}
				and convert(datetime,a.d_doc_date, 102) between convert(datetime, ?, 102) and convert(datetime, ?, 102)
				and (d.i_group = 1 or d.dc_acc_id in (select dc_acc_id from vw_dc_acc_with_parent {$con}))
				and b.i_is_post>1 and b.i_enable = 1 
			group by d.c_code, d.c_name
			order by d.c_code";
}

$stmt = $db->QueryParam($sql, array($date_start, $date_end));
$i = 1;
$str = "";
$sum_dr = 0;
$sum_cr = 0;
while ($data = $db->Fetch($stmt))
{
	$str_dr = ($data["f_dr"] > 0)? number_format($data["f_dr"],2) : "&nbsp;";
	$str_cr = ($data["f_cr"] > 0)? number_format($data["f_cr"],2) : "&nbsp;";
    $str .= "<tr>"
			."<td align='left'>{$data["c_code"]} {$data["c_name"]}</td>"
            ."<td align='right'>{$str_dr}</td>"
			."<td align='right'>{$str_cr}</td>"
            ."</tr>";
			
	$sum_dr += $data["f_dr"];
	$sum_cr += $data["f_cr"];
    $i++;
}// end while

if ($str == "")
    $str = "<tr><td colspan='11'>ไม่พบข้อมูล</td></tr>";

$acc_name = "";
if ($_REQUEST ["i_show_acc"] == 1) {
	$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		foreach ( $for_id as $val ) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
		$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array () );
		$arrParam = array (
				4,
				DELETE_FALSE 
		);
		
		if ($stmt) {
			$name = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
		$acc_name = "รายการบัญชีคุม : <font color='blue'>" . $name . "</font>";
	} else {
		$acc_name = "รายการบัญชีคุม : <font color='blue'>เลือกทั้งหมด</font>";
	}
} else {
	$for_id = explode ( ";", $_REQUEST ["dc_acc_id"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		foreach ( $for_id as $val ) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
		$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array () );
		$arrParam = array (
				4,
				DELETE_FALSE 
		);
		
		if ($stmt) {
			$name = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
		$acc_name = "รายการบัญชีย่อย : <font color='blue'>" . $name . "</font>";
	} else {
		$acc_name = "รายการบัญชีย่อย : <font color='blue'>เลือกทั้งหมด</font>";
	}
}

$period_name = "รอบ : <font color='blue'>เลือกทั้งหมด</font>";
$for_id = explode ( ";", $_REQUEST ["dc_period_id"] );
if (! in_array ( "0", $for_id )) {
	$in = "";
	foreach ( $for_id as $val ) {
		$in .= ($in == "") ? $val : ", " . $val;
	}
	$stmt = $db->QueryParam ( "SELECT c_name FROM dc_period WHERE dc_period_id IN (" . $in . ")", array () );
	
	if ($stmt) {
		$name = "";
		while ( $row = $db->Fetch ( $stmt ) ) {
			$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
		}
	}
	$period_name = "รอบ : <font color='blue'>" . $name . "</font>";
}

$str = "<table cellspacing='0' cellpadding='0' width='100%' border='0' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
            <tr><th colspan='3'>คณะแพทยศาสตร์วชิรพยาบาล มหาวิทยาลัยนวมินทราธิราช</th></tr>
			<tr><th colspan='3'>รายงานรับเงินประจำวัน</th></tr>
            <tr><th colspan='3'>วันที่ ".$date->long_date_from_db($date_start)." ถึงวันที่ ".$date->long_date_from_db($date_end)."</th></tr>
			<tr><th colspan='3' align='left'>{$acc_name}</th></tr>
			<tr><th colspan='3' align='left'>{$period_name}</th></tr>
        </table>
        <table cellspacing='0' cellpadding='0' width='100%' border='1' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
            <tr bgcolor='#A5BAD6'>
                <th width='60%' align='center' rowspan='2'><b>ชื่อบัญชี</b></th>
				<th align='center' colspan='2'><b>จำนวนเงิน</b></th>
            </tr>
			<tr bgcolor='#A5BAD6'>
				<th width='20%' align='center'><b>Dr.</b></th>
				<th width='20%' align='center'><b>Cr.</b></th>
			</tr>
            {$str}
			<tr>
				<th align='center'>รวม</th>
				<th align='right'>".number_format($sum_dr,2)."</th>
				<th align='right'>".number_format($sum_cr,2)."</th>
			</tr>
        </table>
        ";

		
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?php echo COMPANY_NAME;?></title>
<style type="text/css"> body{ padding:0px; margin:0px; } #footer td{ background-color:#fff;} </style>
</head>
<body>
<?php echo $str; ?>
</body>
</html>