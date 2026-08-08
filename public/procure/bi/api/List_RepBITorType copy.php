<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root =  "data";
$data = array();
$con = null;

function Get_ChartTorType()
{
	global $db, $date, $root, $data, $con, $arr_status;
	unset(${$root});
	$totalCount = 0;
	$f_for_debt = 0;
	$yc = 0;
	$y1 = 0;
	$y2 = 0;
	$y3 = 0;
	$y4 = 0;
	$y5 = 0;
	$yl = 0;
	$re = 0;
	$i_groupMenu = "and b.i_groupMenu in (1,2,3,4,5,6,7,8)";
	// $year = isset($_GET['year_en']) ? intval($_GET['year_en']) : date("Y");
	$yearTh = isset($_GET['year_th']) ? intval($_GET['year_th']) : (date('Y') + 543);
	$yearEn = isset($_GET['year_en']) ? intval($_GET['year_en']) : date('Y');
	$chart1 = [];  // ดึงข้อมูลชุดแรก
	$chart2 = [];  // ดึงข้อมูลชุดที่สอง
	$where = ' and  a.i_pr_year = ' . $yearEn;
	// 
	$sqlMain = "SELECT
			b.c_code
			,a.sp_status_report_id
			,b.c_name
			,sum(i_tor_type1)  as i_tor_type1
			,sum(i_tor_type2)  as i_tor_type2
			,sum(i_tor_type3)  as i_tor_type3
			,sum(i_tor_type4)  as i_tor_type4
			,sum(i_tor_type5)  as i_tor_type5
			,sum(i_tor_type1) +sum(i_tor_type2)  +sum(i_tor_type3) +sum(i_tor_type4) as i_tor_type6
			from
			(
				-- 1.รอดำเนินการ
			select --* from sp_tor 
			8 as sp_status_report_id
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 4    THEN 1 ELSE 0 END) AS i_tor_type1
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 3    THEN 1 ELSE 0 END) AS i_tor_type2
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt < 500000    THEN 1 ELSE 0 END) AS i_tor_type3
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt > = 500000    THEN 1 ELSE 0 END) AS i_tor_type4
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 2    THEN 1 ELSE 0 END) AS i_tor_type5
			from sp_tor  a 
			where 1=1
				{$where}
			and a.tor_status_id in(24,25,26,13)
			and a.i_enabled = 1  
			and a.c_code is not null 


			UNION ALL 
				-- 2.อยู่ระหว่างดำเนินการ
			select 
			9 as sp_status_report_id
	        ,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 4    THEN 1 ELSE 0 END) AS i_tor_type1
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 3    THEN 1 ELSE 0 END) AS i_tor_type2
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt < 500000    THEN 1 ELSE 0 END) AS i_tor_type3
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt > = 500000    THEN 1 ELSE 0 END) AS i_tor_type4
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 2    THEN 1 ELSE 0 END) AS i_tor_type5
			from sp_tor  a 
			left join (  SELECT sp_tor_id, MAX(sp_tor_contract_id) AS sp_tor_contract_id
							FROM sp_tor_contract
							GROUP BY sp_tor_id
					)  ss  on ss.sp_tor_id = a.tor_id
			left join sp_tor_contract b on ss.sp_tor_contract_id = b.sp_tor_contract_id 
			where 1=1 	{$where}
			and a.tor_status_id in(1,11,12,14,15,16,17,18,19,20,22,23,28,29,30,31)
			and a.i_enabled = 1  
			and a.c_code is not null 
			and b.c_code is  null 

			UNION ALL 
				-- 3.บริหารสัญญา
			select 

			10 as sp_status_report_id
	        ,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 4    THEN 1 ELSE 0 END) AS i_tor_type1
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 3    THEN 1 ELSE 0 END) AS i_tor_type2
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt < 500000    THEN 1 ELSE 0 END) AS i_tor_type3
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt > = 500000    THEN 1 ELSE 0 END) AS i_tor_type4
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 2    THEN 1 ELSE 0 END) AS i_tor_type5
			from sp_tor a 
			left join (  SELECT sp_tor_id, MAX(sp_tor_contract_id) AS sp_tor_contract_id
							FROM sp_tor_contract
							GROUP BY sp_tor_id
					)  ss  on ss.sp_tor_id = a.tor_id
			left join sp_tor_contract b on ss.sp_tor_contract_id = b.sp_tor_contract_id 
			left join  sp_tor_hdr_period c on b.sp_tor_contract_id = c.sp_tor_contract_id and c.i_is_last = 1
			left join  sp_check_period_hdr d on c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id 
			where   1=1 	{$where} and b.c_code is not null
			and a.tor_status_id  in(20,21,10034)
			AND d.c_code IS  NULL 
			AND a.i_enabled = 1   and a.c_code is not null 

			UNION ALL 
				--4.ตรวจรับพัสดุ
			select 
			11 as sp_status_report_id
	        ,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 4    THEN 1 ELSE 0 END) AS i_tor_type1
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 3    THEN 1 ELSE 0 END) AS i_tor_type2
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt < 500000    THEN 1 ELSE 0 END) AS i_tor_type3
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt > = 500000    THEN 1 ELSE 0 END) AS i_tor_type4
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 2    THEN 1 ELSE 0 END) AS i_tor_type5
			from sp_tor a 
			left join (  SELECT sp_tor_id, MAX(sp_tor_contract_id) AS sp_tor_contract_id
							FROM sp_tor_contract
							GROUP BY sp_tor_id
					)  ss  on ss.sp_tor_id = a.tor_id
			left join sp_tor_contract b on ss.sp_tor_contract_id = b.sp_tor_contract_id 
			left join  sp_tor_hdr_period c on b.sp_tor_contract_id = c.sp_tor_contract_id and c.i_is_last = 1
			left join  sp_check_period_hdr d on c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id 
			where  1=1 	{$where} and b.c_code is not null
			and a.tor_status_id   in(21,10034)
			and isnull(d.po_working_hdr_id,0) = 0 
			and d.c_code is not null
			and a.i_enabled = 1   and a.c_code is not null 

			UNION ALL 
				-- 5.ขออนุมัติเบิกจ่ายเงิน
			select 
			12 as sp_status_report_id
	        ,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 4    THEN 1 ELSE 0 END) AS i_tor_type1
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 3    THEN 1 ELSE 0 END) AS i_tor_type2
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt < 500000    THEN 1 ELSE 0 END) AS i_tor_type3
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt > = 500000    THEN 1 ELSE 0 END) AS i_tor_type4
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 2    THEN 1 ELSE 0 END) AS i_tor_type5

			from sp_tor a 
			inner join sp_tor_contract b on a.tor_id = b.sp_tor_id 
			left join  sp_tor_hdr_period c on b.sp_tor_contract_id = c.sp_tor_contract_id and c.i_is_last = 1
			left join  sp_check_period_hdr d on c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id 
			left join  sp_check_billing_items e on e.sp_check_period_hdr_id = d.sp_check_period_hdr_id 
			left join NMU_EIS..po_working_hdr f on d.po_working_hdr_id = f.po_working_hdr_id 
			where    1=1 	{$where} and b.c_code is not null
			and a.tor_status_id  = 21 
			and isnull(d.po_working_hdr_id,0) > 0 
			and isnull(f.i_status_last,0) < 11   
			and d.c_code is not null
			and a.i_enabled = 1   and a.c_code is not null 

			UNION ALL 
				-- 6.เบิกจ่ายเงินแล้ว
			select 
			13 as sp_status_report_id
	        ,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 4    THEN 1 ELSE 0 END) AS i_tor_type1
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 3    THEN 1 ELSE 0 END) AS i_tor_type2
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt < 500000    THEN 1 ELSE 0 END) AS i_tor_type3
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt > = 500000    THEN 1 ELSE 0 END) AS i_tor_type4
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 2    THEN 1 ELSE 0 END) AS i_tor_type5
			from sp_tor a 
			inner join sp_tor_contract b on a.tor_id = b.sp_tor_id 
			left join  sp_tor_hdr_period c on b.sp_tor_contract_id = c.sp_tor_contract_id and c.i_is_last = 1
			left join  sp_check_period_hdr d on c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id 
			left join  sp_check_billing_items e on e.sp_check_period_hdr_id = d.sp_check_period_hdr_id 
			left join NMU_EIS..po_working_hdr f on d.po_working_hdr_id = f.po_working_hdr_id 
			where    1=1 	{$where}  and b.c_code is not null
			and a.tor_status_id  = 21 
			and isnull(d.po_working_hdr_id,0) > 0 
			and isnull(f.i_status_last,0) >= 11   
			and d.c_code is not null
			and a.i_enabled = 1   and a.c_code is not null 


			UNION ALL 

				-- 7.ยกเลิก
			select 
			15 as sp_status_report_id
	        ,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 4    THEN 1 ELSE 0 END) AS i_tor_type1
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 3    THEN 1 ELSE 0 END) AS i_tor_type2
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt < 500000    THEN 1 ELSE 0 END) AS i_tor_type3
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 1  AND a.f_total_amt > = 500000    THEN 1 ELSE 0 END) AS i_tor_type4
			,SUM(CASE WHEN ISNULL(a.tor_type_id,0) = 2    THEN 1 ELSE 0 END) AS i_tor_type5
			from sp_tor a 
			where   1=1 	{$where}
			-- and isnull(a.i_purchase,0) = 3 
			and a.i_enabled = 2 and c_code is not null 
			) a
			left join sp_status_report b on b.sp_status_report_id =  a.sp_status_report_id and b.i_level = 2
			group by b.c_code,b.c_name,a.sp_status_report_id";
	$stmt = $db->QueryParam($sqlMain, array());
	
	if ($stmt) {
		$i = 0;
		$i_tor_type1 = 0;
		$i_tor_type2 = 0;
		$i_tor_type3 = 0;
		$i_tor_type4 = 0;
		$i_tor_type5 = 0;
		$i_tor_type6 = 0;
		$i_product_type7 = 0;
		$i_product_type8 = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp1 = array(

				"no"                        => ++$i,
				"sp_status_report_id"       => intVal($row["sp_status_report_id"]),
				"c_code"                    => intVal($row["c_code"]),
				"i_tor_type1"               => intVal($row["i_tor_type1"]),
				"i_tor_type2"               => intVal($row["i_tor_type2"]),
				"i_tor_type3"               => intVal($row["i_tor_type3"]),
				"i_tor_type4"               => intVal($row["i_tor_type4"]),
				"i_tor_type5"               => intVal($row["i_tor_type5"]),
				"i_tor_type6"               => intVal($row["i_tor_type6"]),
				"c_name"                    => $row["c_name"],
			);
			${$root}[] = $temp1;
			$i_tor_type1 	+= $row["i_tor_type1"];
			$i_tor_type2 	+= $row["i_tor_type2"];
			$i_tor_type3 	+= $row["i_tor_type3"];
			$i_tor_type4 	+= $row["i_tor_type4"];
			$i_tor_type5 	+= $row["i_tor_type5"];
			$i_tor_type6 	+= $row["i_tor_type6"];
			// $i_product_type7 	+= $row["i_product_type7"];
			// $i_product_type8 += $row["i_product_type8"];
		}
	}
	return json_encode(array(
		"debug"                 => true,
		$root					=> ${$root},
		"no"                    => 9999,
		"i_tor_type1"           => $i_tor_type1,
		"i_tor_type2"           => $i_tor_type2,
		"i_tor_type3"           => $i_tor_type3,
		"i_tor_type4"           => $i_tor_type4,
		"i_tor_type5"           => $i_tor_type5,
		"i_tor_type6"       	=> $i_tor_type6,
		// "i_product_type7"       => $i_product_type7,
		// "i_product_type8"       => $i_product_type8,
		"year_th"               => $yearTh,
		"year_en"               => $yearEn,
		"totalCount"            => $i,
	));
}