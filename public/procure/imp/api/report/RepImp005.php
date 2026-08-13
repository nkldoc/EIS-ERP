<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/date/i_date.class.php");
include("../../../lib/export/exportUtil.php");
###################
$export = new exportUtil ();
$db 	= new DatabaseServer();
$date 	= new i_date();
########################################################################## 

if ($_REQUEST ["mode"] == "excel") {
	$export->headerExcel ( $_REQUEST['titleReport'] );
}

//iSearch
$d_doc_date1 = $date->bc_to_ad($_REQUEST["date_start"]);
$d_doc_date2 = $date->bc_to_ad($_REQUEST["date_end"]);

//detail data
$for_id = explode ( ";", $_REQUEST ["dc_period_id"] );
$con = "";
if (! in_array ( "0", $for_id )) {
	$in = "";
	if (is_array ( $for_id )) {
		foreach ( $for_id as $val ) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
		$con .= ($in != "") ? " AND a.dc_period_id IN (" . $in . ")" : "";
	}
}

$sql = "select convert(varchar(10), cast(b.rmttdate as datetime), 120) as d_date
			, (select c_name from vw_dc_period where dc_period_id = a.dc_period_id) as dc_period_name
			, (select c_name from vw_dc_receive_point where dc_receive_point_id = a.dc_receive_point_id) as dc_receive_point_name
			, a.c_receive_name
			, sum(case when a.dc_receive_point_id not in (2,4,6) then b.rcptamt else 0 end) as f_amt1
			, sum(case when a.dc_receive_point_id in (2,4,6) then b.rcptamt else 0 end) as f_amt2
		from imp_receive_hdr a
			inner join imp_receive_dtl b on a.imp_receive_hdr_id = b.imp_receive_hdr_id
		where a.i_enable = ".STATUS_ENABLE."
			and b.canceldate is null
			and b.paidby = '20'
			and a.d_doc_date between convert(datetime, ?, 102) and convert(datetime, ?, 102)
			{$con}
		group by b.rmttdate, a.dc_period_id, a.dc_receive_point_id, a.c_receive_name
		order by b.rmttdate, dc_period_name, dc_receive_point_name";

$stmt = $db->QueryParam($sql, array($d_doc_date1, $d_doc_date2));
$i = 1;
$str = "";
$sum_amt1 = 0;
$sum_amt2 = 0;
$sum_all = 0;
while ($data = $db->Fetch($stmt))
{
    $str .= "<tr>"
            ."<td align='center'>{$i}</td>"
            ."<td align='center'>".$date->shot_date_from_db($data["d_date"])."</td>"
			."<td align='center'>{$data["dc_period_name"]}</td>"
			."<td align='center'>{$data["dc_receive_point_name"]}</td>"
			."<td align='left'>{$data["c_receive_name"]}</td>"
            ."<td align='right'>".number_format($data["f_amt1"],2)."</td>"
			."<td align='right'>".number_format($data["f_amt2"],2)."</td>"
            ."</tr>";

	$sum_amt1 += $data["f_amt1"];
	$sum_amt2 += $data["f_amt2"];
	$sum_all += ($data["f_amt1"] + $data["f_amt2"]);
    $i++;
}// end while

if ($str == "")
	$str = "<tr><td colspan='7'>ไม่พบข้อมูล</td></tr>";

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
            <tr><th colspan='7'>{$_REQUEST['titleReport']}</th></tr>
			<tr><th colspan='7'>ระหว่างวันที่ ".$date->long_date_from_db($d_doc_date1)." ถึงวันที่ ".$date->long_date_from_db($d_doc_date2)."</th></tr>
			<tr><th colspan='7'>{$period_name}</th></tr>
        </table>
		<table cellspacing='0' cellpadding='0' width='100%' border='1' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
			<thead valign='top'>
            <tr bgcolor='#A5BAD6'>
                <th width='3%' align='center' rowspan='2'><b>ที่</b></th>
                <th width='10%' align='center' rowspan='2'><b>วันที่</b></th>
				<th width='10%' align='center' rowspan='2'><b>ช่วงเวลา</b></th>
				<th width='10%' align='center' rowspan='2'><b>จุดรับเงิน</b></th>
				<th width='10%' align='center' rowspan='2'><b>เจ้าหน้าที่<br />รับเงิน</b></th>
				<th width='7%' align='center' colspan='2'><b>ธนาคาร</b></th>
            </tr>
			<tr bgcolor='#A5BAD6'>
				<th width='10%' align='center'><b>ธ.กรุงไทย</b></th>
				<th width='10%' align='center'><b>ธ.กรุงเทพ</b></th>
			</tr>
			</thead>
			<tbody>
			{$str}
			
			<tr>
				<th colspan='5' align='right'>รวม</th>
				<th align='right'>".number_format($sum_amt1,2)."</th>
				<th align='right'>".number_format($sum_amt2,2)."</th>
			</tr>
			<tr>
				<th colspan='6' align='right'>รวมทั้งสิ้น</th>
				<th align='right'>".number_format($sum_all,2)."</th>
			</tr>
			</tbody>
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