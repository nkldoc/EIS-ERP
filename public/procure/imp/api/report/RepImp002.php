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
$d_doc_date1 = $date->bc_to_ad($_REQUEST["d_doc_date1"]);
$d_doc_date2 = $date->bc_to_ad($_REQUEST["d_doc_date2"]);

$sql = "select convert(varchar(10), cast(b.rmttdate as datetime), 120) as d_date
			, (select c_name from vw_dc_period where dc_period_id = a.dc_period_id) as dc_period_name
			, (select c_name from vw_dc_receive_point where dc_receive_point_id = a.dc_receive_point_id) as dc_receive_point_name
			, a.c_receive_name
			, (select count(rcptno)
				from (select distinct bb.rcptno
				from imp_receive_hdr aa
					inner join imp_receive_dtl bb on aa.imp_receive_hdr_id = bb.imp_receive_hdr_id
				where bb.canceldate is not null
					and bb.rmttdate = b.rmttdate
					and aa.dc_period_id = a.dc_period_id
					and aa.dc_receive_point_id = a.dc_receive_point_id
					and aa.c_receive_name = a.c_receive_name) zz) as i_rec_items
			, count(b.rcptamt) as i_items
			, sum(case b.paidby when 10 then b.rcptamt else 0 end) as f_amt1
			, sum(case b.paidby when 20 then b.rcptamt else 0 end) as f_amt2
			, sum(case b.paidby when 30 then b.rcptamt else 0 end) as f_amt3
			, sum(case b.paidby when 40 then b.rcptamt else 0 end) as f_amt4
			, a.c_comment 
		from imp_receive_hdr a
			inner join imp_receive_dtl b on a.imp_receive_hdr_id = b.imp_receive_hdr_id
		where b.canceldate is not null
		and a.d_doc_date between convert(datetime, ?, 102) and convert(datetime, ?, 102)
		group by b.rmttdate, a.dc_period_id
			, a.dc_receive_point_id, a.c_receive_name, a.c_comment 
		order by b.rmttdate, dc_period_name, dc_receive_point_name";

$stmt = $db->QueryParam($sql, array($d_doc_date1, $d_doc_date2));
$i = 1;
$str = "";
$sum_rec_items = 0;
$sum_items = 0;
$sum_amt1 = 0;
$sum_amt2 = 0;
$sum_amt3 = 0;
$sum_amt4 = 0;
$sum_all = 0;
while ($data = $db->Fetch($stmt))
{
    $str .= "<tr>"
            ."<td align='center'>{$i}</td>"
            ."<td align='center'>".$date->shot_date_from_db($data["d_date"])."</td>"
			."<td align='center'>{$data["dc_period_name"]}</td>"
			."<td align='center'>{$data["dc_receive_point_name"]}</td>"
			."<td align='left'>{$data["c_receive_name"]}</td>"
			."<td align='center'>".number_format($data["i_rec_items"],0)."</td>"
			."<td align='center'>".number_format($data["i_items"],0)."</td>"
            ."<td align='right'>".number_format($data["f_amt1"],2)."</td>"
			."<td align='right'>".number_format($data["f_amt2"],2)."</td>"
			."<td align='right'>".number_format($data["f_amt3"],2)."</td>"
			."<td align='right'>".number_format($data["f_amt4"],2)."</td>"
            ."<td align='left'>{$data["c_comment"]}</td>"
            ."</tr>";
			
	$sum_rec_items += $data["i_rec_items"];
	$sum_items += $data["i_items"];
	$sum_amt1 += $data["f_amt1"];
	$sum_amt2 += $data["f_amt2"];
	$sum_amt3 += $data["f_amt3"];
	$sum_amt4 += $data["f_amt4"];
	$sum_all += ($data["f_amt1"] + $data["f_amt2"] + $data["f_amt3"] + $data["f_amt4"]);
    $i++;
}// end while

if ($str == "")
    $str = "<tr><td colspan='12'>ไม่พบข้อมูล</td></tr>";

$str = "<table cellspacing='0' cellpadding='0' width='100%' border='0' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
            <tr><th colspan='12'>{$_REQUEST['titleReport']}</th></tr>
            <tr><th colspan='12'>ระหว่างวันที่ ".$date->long_date_from_db($d_doc_date1)." ถึงวันที่ ".$date->long_date_from_db($d_doc_date2)."</th></tr>
        </table>
		<table cellspacing='0' cellpadding='0' width='100%' border='1' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
			<thead valign='top'>
            <tr bgcolor='#A5BAD6'>
                <th width='3%' align='center' rowspan='2'><b>ที่</b></th>
                <th width='10%' align='center' rowspan='2'><b>วันที่</b></th>
				<th width='10%' align='center' rowspan='2'><b>ช่วงเวลา</b></th>
				<th width='10%' align='center' rowspan='2'><b>จุดรับเงิน</b></th>
				<th width='10%' align='center' rowspan='2'><b>เจ้าหน้าที่<br />รับเงิน</b></th>
				<th width='7%' align='center' rowspan='2'><b>จำนวนใบเสร็จ<br />ที่ยกเลิก</b></th>
				<th width='7%' align='center' rowspan='2'><b>จำนวนที่<br />ยกเลิก</b></th>
				<th width='7%' align='center' colspan='4'><b>ประเภทใบเสร็จรับเงินที่ยกเลิก</b></th>
				<th width='10%' align='center' rowspan='2'><b>หมายเหตุ</b></th>
            </tr>
			<tr bgcolor='#A5BAD6'>
				<th width='10%' align='center'><b>เงินสด</b></th>
				<th width='10%' align='center'><b>เช็ค</b></th>
				<th width='10%' align='center'><b>เงินโอน</b></th>
				<th width='10%' align='center'><b>บัตรเครดิต</b></th>
			</tr>
			</thead>
			<tbody>
			{$str}
			
			<tr>
				<th colspan='5' align='right'>รวม</th>
				<th align='center'>".number_format($sum_rec_items,0)."</th>
				<th align='center'>".number_format($sum_items,0)."</th>
				<th align='right'>".number_format($sum_amt1,2)."</th>
				<th align='right'>".number_format($sum_amt2,2)."</th>
				<th align='right'>".number_format($sum_amt3,2)."</th>
				<th align='right'>".number_format($sum_amt4,2)."</th>
				<th>&nbsp;</td>
			</tr>
			<tr>
				<th colspan='10' align='right'>รวมทั้งสิ้น</th>
				<th align='right'>".number_format($sum_all,2)."</th>
				<th>&nbsp;</th>
			</tr>
			</tbody>
        </table>
        ";

//if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str); 			
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