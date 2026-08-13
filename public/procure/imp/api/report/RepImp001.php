<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/date/i_date.class.php");
include("../../../lib/export/exportUtil.php");

###################
$export = new exportUtil ();
$db 	= new DatabaseServer();
$date 	= new i_date();
$titleReport = 'รายงานรับเงินประจำวัน';
########################################################################## 

if ($_REQUEST ["mode"] == "excel") {
	$export->headerExcel ( $titleReport );
}

//iSearch
//$d_doc_date = $_REQUEST["d_doc_date"];//$date->bc_to_ad($_REQUEST["d_doc_date"]);
$c_yyyy = $_REQUEST["year"];
$date_start = $_REQUEST["date_start"];
$date_end = $_REQUEST["date_end"];

$d_doc_date = $_REQUEST["date_start"];
//head data
$sql_h = "select dc_receive_point_id, c_name from vw_dc_receive_point where 1 = ? order by c_name";
$stmtH = $db->QueryParam($sql_h, array(1));
$arrH = array();
$arrSumG = array();
$arrSumAll = array();
$strH1 = "";
$strH2 = "";
$countH = 4;
$countPoint = 0;
while ($dataH = $db->Fetch($stmtH))
{
	$arrH[$dataH["dc_receive_point_id"]] = $dataH["c_name"];
	$arrSumG[$dataH["dc_receive_point_id"]] = 0;
	$arrSumAll[$dataH["dc_receive_point_id"]] = 0;
	
	$strH2 .= "<th>{$dataH["c_name"]}</th>";
	$countH++;
	$countPoint++;
}
$countPoint = $countPoint+2;
$arrHAcc = array("f_cr", "f_dr");
$strH2 .= "<th>สมุดรายวัน<br />เงินรับ</th>";
$strH2 .= "<th>สมุดรายวัน<br />เงินจ่าย</th>";

$strH1 .= "<th colspan='{$countPoint}'>รับจาก</th>";

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
$sqlD = "select a.dc_receive_point_id, c.dc_product_id, sum(b.rcptamt) as f_amount
		from imp_receive_hdr a
			inner join imp_receive_dtl b on a.imp_receive_hdr_id = b.imp_receive_hdr_id
			inner join vw_dc_product c on b.income = c.c_map_code
		where a.i_enable = ".STATUS_ENABLE."
			and b.canceldate is null and a.d_doc_date between convert(datetime, ?, 102) and convert(datetime, ?, 102)
			{$con}
		group by a.dc_receive_point_id, c.dc_product_id";
$stmtD = $db->QueryParam($sqlD, array($date_start, $date_end));
$arrData = array();
$strProductID = "0";
while ($dataD = $db->Fetch($stmtD))
{
	$arrData[$dataD["dc_product_id"]][$dataD["dc_receive_point_id"]] = $dataD["f_amount"];
	$strProductID .= ", {$dataD["dc_product_id"]}";
}

//detail report
$sql = "select a.dc_product_group_id, a.c_name as group_name, b.dc_product_id, b.c_name
		from vw_dc_product_group a
			inner join vw_dc_product b on a.dc_product_group_id = b.dc_product_group_id
		where 1 = ? and b.dc_product_id in ({$strProductID})
		order by a.c_name, b.c_name";

$stmt = $db->QueryParam($sql, array(1));
$i = 1;
$str = "";
$sum_line = 0;
$sum_group = 0;
$sum_all = 0;
$group_id = 0;
$group_name = "";
while ($data = $db->Fetch($stmt))
{
	if ($data["dc_product_group_id"] != $group_id)
	{
		if ($sum_group <> 0)
		{
			$str .= "<tr bgcolor='#F4F4F4'>"
					."<th align='right'>รวม {$group_name}</tg>";
			if (is_array($arrH))
			{
				foreach($arrH as $receive_id => $receive_name)
				{
					$value = $arrSumG[$receive_id];
					$strValue = ($value <> 0)? number_format($value, 2) : "&nbsp;";
					$str .= "<th align='right'>{$strValue}</th>";
					$arrSumG[$receive_id] = 0;
				}
			}
			
			// gl
			if (is_array($arrHAcc))
			{
				foreach($arrHAcc as $ind => $f_acc)
				{
					//$value = $arrSumG[$receive_id];
					//$strValue = ($value > 0)? number_format($value, 2) : "&nbsp;";
					$strValue = "&nbsp;";
					$str .= "<th align='right'>{$strValue}</th>";
					//$arrSumG[$receive_id] = 0;
				}
			}
			
			$strSumLine = ($sum_group <> 0)? number_format($sum_group, 2) : "&nbsp;";
			$str .= "<th align='right'>{$strSumLine}</th>"
					."</tr>";
			$sum_group = 0;
		}
		
		$str .= "<tr bgcolor='#F4F4F4'><th colspan='{$countH}' align='left'>{$data["group_name"]}</th></tr>";
		$group_id = $data["dc_product_group_id"];
		$group_name = $data["group_name"];
	}
	
	$sum_line = 0;
    $str .= "<tr>"
            ."<td align='left' nowrap>{$data["c_name"]}</td>";
    if (is_array($arrH))
	{
		foreach($arrH as $receive_id => $receive_name)
		{
			$value = 0;
			if (array_key_exists($receive_id, $arrData[$data["dc_product_id"]])) {
				$value = $arrData[$data["dc_product_id"]][$receive_id];
			}
			$strValue = ($value <> 0)? number_format($value, 2) : "&nbsp;";
			$str .= "<td align='right'>{$strValue}</td>";
			
			$sum_line += $value;
			$sum_group += $value;
			$sum_all += $value;
			$arrSumG[$receive_id] += $value;
			$arrSumAll[$receive_id] += $value;
		}
	}
	
	// gl
	if (is_array($arrHAcc))
	{
		foreach($arrHAcc as $ind => $f_acc)
		{
			$value = 0;
			$strValue = ($value <> 0)? number_format($value, 2) : "&nbsp;";
			$str .= "<td align='right'>{$strValue}</td>";
		}
	}
	
	$strSumLine = ($sum_line <> 0)? number_format($sum_line, 2) : "&nbsp;";
    $str .= "<td align='right'>{$strSumLine}</td>"
            ."</tr>";
	
    $i++;
}// end while

if ($str != "")
{
	if ($sum_group <> 0)
	{
		$str .= "<tr bgcolor='#F4F4F4'>"
				."<th align='right'>รวม {$group_name}</tg>";
		if (is_array($arrH))
		{
			foreach($arrH as $receive_id => $receive_name)
			{
				$value = $arrSumG[$receive_id];
				$strValue = ($value <> 0)? number_format($value, 2) : "&nbsp;";
				$str .= "<th align='right'>{$strValue}</th>";
				$arrSumG[$receive_id] = 0;
			}
		}
		
		//gl
		if (is_array($arrHAcc))
		{
			foreach($arrHAcc as $ind => $f_acc)
			{
				$value = 0;
				$strValue = ($value <> 0)? number_format($value, 2) : "&nbsp;";
				$str .= "<th align='right'>{$strValue}</th>";
				$arrSumG[$receive_id] = 0;
			}
		}
		$strSumLine = ($sum_group <> 0)? number_format($sum_group, 2) : "&nbsp;";
		$str .= "<th align='right'>{$strSumLine}</th>"
				."</tr>";
		$sum_group = 0;
	}
}

//จาก GL
$arrSumAccG = array("f_dr"=> 0.00, "f_cr"=> 0.00);
$arrSumAccAll = array("f_dr"=> 0.00, "f_cr"=> 0.00);

$sql = "select a.dc_acc_id, a.c_code, a.c_name 
			, left(a.c_code,3)+'00000000' as parent_code
			, (select c_name from vw_dc_acc where c_code = left(a.c_code,3)+'00000000') as parent_name
			, sum(b.f_dr)*-1 as f_dr
			, sum(b.f_cr ) as f_cr
		from vw_dc_acc a
			inner join gl_tran_dtl b on a.dc_acc_id = b.dc_acc_id
			inner join gl_tran_hdr c on b.gl_tran_hdr_id = c.gl_tran_hdr_id
		where isnull(c.table_name,'') != 'imp_receive_hdr'	
			and c.i_is_post>1 and c.i_enable=1 and c.i_is_close_year=2
			and c.d_save_date between convert(datetime, ?, 102) and convert(datetime, ?, 102)
			and a.dc_acc_id in (select dc_acc_id from conf_acc_rep where report_number = 1)
		group by a.dc_acc_id, a.c_code, a.c_name
		order by a.c_code";

$stmtAcc = $db->QueryParam($sql, array($date_start, $date_end));
$tempParentCode = "";
$tempParentName = "";
while ($data = $db->Fetch($stmtAcc))
{
	if ($data["parent_code"] != $tempParentCode)
	{
		if ($sum_group <> 0)
		{
			$str .= "<tr bgcolor='#F4F4F4'>"
					."<th align='right'>รวม {$tempParentCode} {$tempParentName}</tg>";
			if (is_array($arrH))
			{
				foreach($arrH as $receive_id => $receive_name)
				{
					$strValue = "&nbsp;";
					$str .= "<th align='right'>{$strValue}</th>";
				}
			}
			
			// gl
			if (is_array($arrHAcc))
			{
				foreach($arrHAcc as $ind => $f_acc)
				{
					$value = $arrSumAccG[$f_acc];
					$strValue = ($value <> 0)? number_format($value, 2) : "&nbsp;";
					$str .= "<th align='right'>{$strValue}</th>";
					$arrSumAccG[$f_acc] = 0;
				}
			}
			
			$strSumLine = ($sum_group <> 0)? number_format($sum_group, 2) : "&nbsp;";
			$str .= "<th align='right'>{$strSumLine}</th>"
					."</tr>";
			$sum_group = 0;
		}
		
		$str .= "<tr bgcolor='#F4F4F4'><th colspan='{$countH}' align='left'>{$data["parent_code"]} {$data["parent_name"]}</th></tr>";
		$tempParentCode = $data["parent_code"];
		$tempParentName = $data["parent_name"];
	}
	
	$sum_line = 0;
    $str .= "<tr>"
            ."<td align='left' nowrap>{$data["c_code"]} {$data["c_name"]}</td>";
    if (is_array($arrH))
	{
		foreach($arrH as $receive_id => $receive_name)
		{
			$strValue = "&nbsp;";
			$str .= "<td align='right'>{$strValue}</td>";
		}
	}
		
	// gl cr
	$value = $data["f_cr"];			
	$strValue = ($value <> 0)? number_format($value, 2) : "&nbsp;";
	$str .= "<td align='right'>{$strValue}</td>";
	
	$sum_line += $value;
	$sum_group += $value;
	$sum_all += $value;
	$arrSumAccG["f_cr"] += $value;
	$arrSumAccAll["f_cr"] += $value;
	
	
	// gl dr
	$value = $data["f_dr"];			
	$strValue = ($value <> 0)? number_format($value, 2) : "&nbsp;";
	$str .= "<td align='right'>{$strValue}</td>";
	
	$sum_line += $value;
	$sum_group += $value;
	$sum_all += $value;
	$arrSumAccG["f_dr"] += $value;
	$arrSumAccAll["f_dr"] += $value;

	
	
	$strSumLine = ($sum_line <> 0)? number_format($sum_line, 2) : "&nbsp;";
    $str .= "<td align='right'>{$strSumLine}</td>"
            ."</tr>";
	
    $i++;
}// จบ GL
if ($sum_group > 0)
{
	$str .= "<tr bgcolor='#F4F4F4'>"
			."<th align='right'>รวม {$tempParentCode} {$tempParentName}</tg>";
	if (is_array($arrH))
	{
		foreach($arrH as $receive_id => $receive_name)
		{
			$strValue = "&nbsp;";
			$str .= "<th align='right'>{$strValue}</th>";
		}
	}
	
	// gl
	if (is_array($arrHAcc))
	{
		foreach($arrHAcc as $ind => $f_acc)
		{
			$value = $arrSumAccG[$f_acc];
			$strValue = ($value <> 0)? number_format($value, 2) : "&nbsp;";
			$str .= "<th align='right'>{$strValue}</th>";
			$arrSumAccG[$f_acc] = 0;
		}
	}
	
	$strSumLine = ($sum_group <> 0)? number_format($sum_group, 2) : "&nbsp;";
	$str .= "<th align='right'>{$strSumLine}</th>"
			."</tr>";
	$sum_group = 0;
}

if ($str == "")
{
	$str = "<tr><td colspan='{$countH}'>ไม่พบข้อมูล</td></tr>";
}
else
{
	if ($sum_all <> 0)
	{
		$str .= "<tr bgcolor='#F4F4F4'>"
				."<th align='right'>รวมทั้งสิ้น</tg>";
		if (is_array($arrH))
		{
			foreach($arrH as $receive_id => $receive_name)
			{
				$value = $arrSumAll[$receive_id];
				$strValue = ($value <> 0)? number_format($value, 2) : "&nbsp;";
				$str .= "<th align='right'>{$strValue}</th>";
			}
		}
		
		//gl
		if (is_array($arrHAcc))
		{
			foreach($arrHAcc as $ind => $f_acc)
			{
				$value = $arrSumAccAll[$f_acc];
				$strValue = ($value <> 0)? number_format($value, 2) : "&nbsp;";
				$str .= "<th align='right'>{$strValue}</th>";
				$arrSumG[$receive_id] = 0;
			}
		}
		
		$strSumLine = ($sum_all <> 0)? number_format($sum_all, 2) : "&nbsp;";
		$str .= "<th align='right'>{$strSumLine}</th>"
				."</tr>";
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
            <tr><th colspan='{$countH}'>รายงานรับเงินประจำวัน ประจำวันที่ ".$date->long_date_from_db($date_start)." ถึง ".$date->long_date_from_db($date_end)."</th></tr>
			<tr><th colspan='{$countH}' align='left'>{$period_name}</th></tr>
        </table>
        <table cellspacing='0' cellpadding='0' width='100%' border='1' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
            <tr bgcolor='#A5BAD6'>
                <th width='3%' align='center' rowspan='2'><b>พนง.เก็บเงิน</b></th>
                {$strH1}
				<th width='10%' align='center' rowspan='2'><b>รวมทั้งสิ้น</b></th>
            </tr>
			<tr bgcolor='#A5BAD6'>
				{$strH2}
			</tr>
            {$str}
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