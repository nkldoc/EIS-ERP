<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root =  "data";
$data = array();
$con = null;


function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;

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
	// setParam
	// $month  = sprintf("%02d", $m);
	// $year   = sprintf("%04d", $yyyy);
	$i_groupMenu = "and b.i_groupMenu in (1,2,3,4,5,6,7,8)";
	// $year = isset($_GET['year_en']) ? intval($_GET['year_en']) : date("Y");
	$yearTh = isset($_GET['year_th']) ? intval($_GET['year_th']) : (date('Y') + 543);
	$yearEn = isset($_GET['year_en']) ? intval($_GET['year_en']) : date('Y');
	$chart1 = [];  // ดึงข้อมูลชุดแรก
	$chart2 = [];  // ดึงข้อมูลชุดที่สอง
	$where = ' and  a.i_pr_year = ' . $yearEn;
	// 
	$sqlMain = "SELECT 
					CASE 
						WHEN a.sp_emp_id IS NULL OR a.sp_emp_id = 0 THEN 'ยังไม่ได้ระบุ'
						ELSE b.c_name
					END AS sp_emp_name
					,isnull(a.sp_emp_id,9999999) as sp_emp_id
					,isnull(b.c_name,'ยังไม่ได้ระบุ/ยกเลิก') as c_name
					,sum(i_product_type1)  as  i_product_type1
					,sum(i_product_type2)  as i_product_type2
					,sum(i_product_type3)  as i_product_type3
					,sum(i_product_type4)  as i_product_type4
					,sum(i_product_type5)  as i_product_type5
					,sum(i_product_type6)  as i_product_type6
					,sum(i_product_type7)  as i_product_type7
					,sum(i_product_type1) +sum(i_product_type2)  +sum(i_product_type3)  
					+sum(i_product_type4) +sum(i_product_type5) +sum(i_product_type6) +sum(i_product_type7)  
					as i_product_type8
					from
					(
						-- 1.ครุภัณฑ์ ซื้อ
					select 
					isnull(a.sp_emp_id,0) as sp_emp_id
					,count(a.tor_id) as i_product_type1
					,0 as i_product_type2
					,0 as i_product_type3
					,0 as i_product_type4
					,0 as i_product_type5
					,0 as i_product_type6
					,0 as i_product_type7
					from sp_tor  a 
					LEFT join sp_emp b  on a.sp_emp_id = b.sp_emp_id 
					where 1 = 1 
					-- b.sp_emp_id  > 0  and b.dc_department_id > 0 
					{$where}
					-- and i_enabled = 1  
					and isnull(i_product_type,0) = 2 
					and a.c_code is not null 
					GROUP BY a.sp_emp_id  

					UNION ALL 
						-- 2.วัสดุ ซื้อ
					select 
					isnull(a.sp_emp_id,0) as sp_emp_id
					,0 as i_product_type1
					,count(a.tor_id) as i_product_type2
					,0 as i_product_type3
					,0 as i_product_type4
					,0 as i_product_type5
					,0 as i_product_type6
					,0 as i_product_type7
					from sp_tor  a 
					LEFT join sp_emp b  on a.sp_emp_id = b.sp_emp_id 
					where 1 = 1 
					-- b.sp_emp_id  > 0  and b.dc_department_id > 0 
					{$where} 
					-- and i_enabled = 1  
					and isnull(i_product_type,0) = 1 and c_code is not null 
					GROUP BY a.sp_emp_id  

					UNION ALL 
						-- 3.จ้าง ไม่ได้ของ
					select 
					isnull(a.sp_emp_id,0) as sp_emp_id
					,0 as i_product_type1
					,0 as i_product_type2
					,count(a.tor_id) as i_product_type3
					,0 as i_product_type4
					,0 as i_product_type5
					,0 as i_product_type6
					,0 as i_product_type7
					from sp_tor a 
					LEFT join sp_emp b  on a.sp_emp_id = b.sp_emp_id 
					where 1 = 1 
					-- b.sp_emp_id  > 0  and b.dc_department_id > 0 
					{$where}
					AND isnull(a.i_purchase,0) = 2 
					-- AND a.i_enabled = 1  
					AND a.i_type_bg <> 2
					AND isnull(a.i_product_type,0) = 0 
					AND c_code is not null 
					GROUP BY a.sp_emp_id  

					UNION ALL 
						--4.เช่า ไม่ได้ของ
					select 
					isnull(a.sp_emp_id,0) as sp_emp_id
					,0 as i_product_type1
					,0 as i_product_type2
					,0 as i_product_type3
					,count(a.tor_id) as i_product_type4
					,0 as i_product_type5
					,0 as i_product_type6
					,0 as i_product_type7
					from sp_tor a 
					LEFT join sp_emp b  on a.sp_emp_id = b.sp_emp_id 
					where 1 = 1 
					-- b.sp_emp_id  > 0  and b.dc_department_id > 0 
					{$where}
					and isnull(a.i_purchase,0) = 3 
					-- and i_enabled = 1  
					and isnull( i_product_type,0) = 0 and c_code is not null 
					GROUP BY a.sp_emp_id  

					UNION ALL 
						-- 5.โครงการต่อเนื่อง
					select 
					isnull(a.sp_emp_id,0) as sp_emp_id
					,0 as i_product_type1
					,0 as i_product_type2
					,0 as i_product_type3
					,0 as i_product_type4
					,count(a.tor_id) as i_product_type5
					,0 as i_product_type6
					,0 as i_product_type7
					from sp_tor a 
					LEFT join sp_emp b  on a.sp_emp_id = b.sp_emp_id 
					where 1 = 1 
					-- b.sp_emp_id  > 0  and b.dc_department_id > 0 
					{$where}
					and isnull(i_type_bg,0) = 2  
					-- and i_enabled = 1 
					--   and isnull( i_product_type,0) = 0
					and c_code is not null 
					GROUP BY a.sp_emp_id  

					UNION ALL 
						-- 6.จะซื้อจะขาย
					select 
					isnull(a.sp_emp_id,0) as sp_emp_id
					,0 as i_product_type1
					,0 as i_product_type2
					,0 as i_product_type3
					,0 as i_product_type4
					,0 as i_product_type5
					,count(a.tor_id) as i_product_type6
					,0 as i_product_type7
					from sp_tor a 
					LEFT join sp_emp b  on a.sp_emp_id = b.sp_emp_id 
					where 1 = 1 
					-- b.sp_emp_id  > 0  and b.dc_department_id > 0 
					{$where}
					and isnull(a.i_type_contract,0) = 3 
					-- and i_enabled = 1  
					--  and isnull( i_product_type,0) = 0 
					and c_code is not null 
					GROUP BY a.sp_emp_id  

					UNION ALL 
						-- 7.ก่อสร้าง
					select 
					isnull(a.sp_emp_id,0) as sp_emp_id
					,0 as i_product_type1
					,0 as i_product_type2
					,0 as i_product_type3
					,0 as i_product_type4
					,0 as i_product_type5
					,0 as i_product_type6
					,count(a.tor_id) as i_product_type7
					from sp_tor a 
					LEFT join sp_emp b  on a.sp_emp_id = b.sp_emp_id 
					where 1 = 1 
					-- b.sp_emp_id  > 0  and b.dc_department_id > 0 
					{$where}
					AND isnull(a.i_purchase,0) = 1 
					AND isnull(a.i_type_contract,0) = 3 
					-- and i_enabled = 1  
					and isnull( i_product_type,0) = 0 and c_code is not null 
					GROUP BY a.sp_emp_id  

					) a
			LEFT join sp_emp b on b.sp_emp_id=  a.sp_emp_id 
			group by a.sp_emp_id,b.c_name";
	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {
		$i = 0;
		$i_product_type1 = 0;
		$i_product_type2 = 0;
		$i_product_type3 = 0;
		$i_product_type4 = 0;
		$i_product_type5 = 0;
		$i_product_type6 = 0;
		$i_product_type7 = 0;
		$i_product_type8 = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(

				"no"                	=> ++$i,
				"sp_emp_id"         	=> intVal($row["sp_emp_id"]),
				"i_product_type1"    	=> intVal($row["i_product_type1"]),
				"i_product_type2"    	=> intVal($row["i_product_type2"]),
				"i_product_type3"    	=> intVal($row["i_product_type3"]),
				"i_product_type4"    	=> intVal($row["i_product_type4"]),
				"i_product_type5"    	=> intVal($row["i_product_type5"]),
				"i_product_type6"    	=> intVal($row["i_product_type6"]),
				"i_product_type7"    	=> intVal($row["i_product_type7"]),
				"i_product_type8"    => intVal($row["i_product_type8"]),
				"c_name"       			=> $row["c_name"],
			);
			${$root}[] = $temp;
			$i_product_type1 	+= $row["i_product_type1"];
			$i_product_type2 	+= $row["i_product_type2"];
			$i_product_type3 	+= $row["i_product_type3"];
			$i_product_type4 	+= $row["i_product_type4"];
			$i_product_type5 	+= $row["i_product_type5"];
			$i_product_type6 	+= $row["i_product_type6"];
			$i_product_type7 	+= $row["i_product_type7"];
			$i_product_type8    += $row["i_product_type8"];
		}
	}
	return json_encode(array(
		"debug"							=> true,
		$root							=> ${$root},
		"no"							=> 9999,
		"i_product_type1"				=> $i_product_type1,
		"i_product_type2"				=> $i_product_type2,
		"i_product_type3"				=> $i_product_type3,
		"i_product_type4"				=> $i_product_type4,
		"i_product_type5"				=> $i_product_type5,
		"i_product_type6"				=> $i_product_type6,
		"i_product_type7"				=> $i_product_type7,
		"i_product_type8"				=> $i_product_type8,
		"year_th"                    	=> $yearTh,
		"year_en"                    	=> $yearEn,
		"totalCount"                    => $i,
	));
}
function Get_Chart2Data()
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
			,sum(i_product_type1)  as  i_product_type1
			,sum(i_product_type2)  as i_product_type2
			,sum(i_product_type3)  as i_product_type3
			,sum(i_product_type4)  as i_product_type4
			,sum(i_product_type5)  as i_product_type5
			,sum(i_product_type6)  as i_product_type6
			,sum(i_product_type7)  as i_product_type7
			,sum(i_product_type1) +sum(i_product_type2)  +sum(i_product_type3)  
			+sum(i_product_type4) +sum(i_product_type5) +sum(i_product_type6) +sum(i_product_type7)  
			as i_product_type8
			from
			(
				-- 1.รอดำเนินการ
			select 
			8 as sp_status_report_id
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type1
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 1  THEN 1 ELSE 0 END) AS i_product_type2
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 2  AND  ISNULL(a.i_product_type,0) = 0 AND ISNULL(a.i_type_bg,0) <> 2 THEN 1 ELSE 0 END) AS i_product_type3
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type4
			,SUM(CASE WHEN ISNULL(a.i_type_bg, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type5
			,SUM(CASE WHEN ISNULL(a.i_type_contract, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type6
			,0 as i_product_type7
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
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type1
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 1  THEN 1 ELSE 0 END) AS i_product_type2
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 2  AND  ISNULL(a.i_product_type,0) = 0 AND ISNULL(a.i_type_bg,0) <> 2 THEN 1 ELSE 0 END) AS i_product_type3
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type4
			,SUM(CASE WHEN ISNULL(a.i_type_bg, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type5
			,SUM(CASE WHEN ISNULL(a.i_type_contract, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type6
			,0 as i_product_type7
			from sp_tor  a 
			left join (  SELECT sp_tor_id, MAX(sp_tor_contract_id) AS sp_tor_contract_id
							FROM sp_tor_contract
							GROUP BY sp_tor_id
					)  ss  on ss.sp_tor_id = a.tor_id
			left join sp_tor_contract b on ss.sp_tor_contract_id = b.sp_tor_contract_id 
			
			where 1=1 	{$where}
			and a.tor_status_id in(1,11,12,14,15,16,17,18,19,20,22,23,28,29,30,31)
			AND b.c_code is null
			and a.i_enabled = 1  
			and a.c_code is not null 

			UNION ALL 
				-- 3.บริหารสัญญา
			select 

			10 as sp_status_report_id
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type1
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 1  THEN 1 ELSE 0 END) AS i_product_type2
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 2  AND  ISNULL(a.i_product_type,0) = 0 AND ISNULL(a.i_type_bg,0) <> 2 THEN 1 ELSE 0 END) AS i_product_type3
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type4
			,SUM(CASE WHEN ISNULL(a.i_type_bg, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type5
			,SUM(CASE WHEN ISNULL(a.i_type_contract, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type6
			,0 as i_product_type7
			from sp_tor a 
			left join (  SELECT sp_tor_id, MAX(sp_tor_contract_id) AS sp_tor_contract_id
							FROM sp_tor_contract
							GROUP BY sp_tor_id
					)  ss  on ss.sp_tor_id = a.tor_id
			left join sp_tor_contract b on ss.sp_tor_contract_id = b.sp_tor_contract_id 
			left join  sp_tor_hdr_period c on b.sp_tor_contract_id = c.sp_tor_contract_id and c.i_is_last = 1
			left join  sp_check_period_hdr d on c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id 
			where   1=1 	{$where} and b.c_code is not null
			and a.tor_status_id  in(21,10034)
			AND (  c.sp_tor_hdr_period_id IS NULL  OR d.c_code IS NOT NULL )
			AND a.i_enabled = 1   and a.c_code is not null 

			UNION ALL 
				--4.ตรวจรับพัสดุ
			select 
			11 as sp_status_report_id
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type1
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 1  THEN 1 ELSE 0 END) AS i_product_type2
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 2  AND  ISNULL(a.i_product_type,0) = 0 AND ISNULL(a.i_type_bg,0) <> 2 THEN 1 ELSE 0 END) AS i_product_type3
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type4
			,SUM(CASE WHEN ISNULL(a.i_type_bg, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type5
			,SUM(CASE WHEN ISNULL(a.i_type_contract, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type6
			,0 as i_product_type7

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
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type1
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 1  THEN 1 ELSE 0 END) AS i_product_type2
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 2  AND  ISNULL(a.i_product_type,0) = 0 AND ISNULL(a.i_type_bg,0) <> 2 THEN 1 ELSE 0 END) AS i_product_type3
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type4
			,SUM(CASE WHEN ISNULL(a.i_type_bg, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type5
			,SUM(CASE WHEN ISNULL(a.i_type_contract, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type6
			,0 as i_product_type7

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
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type1
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 1  THEN 1 ELSE 0 END) AS i_product_type2
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 2  AND  ISNULL(a.i_product_type,0) = 0 AND ISNULL(a.i_type_bg,0) <> 2 THEN 1 ELSE 0 END) AS i_product_type3
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type4
			,SUM(CASE WHEN ISNULL(a.i_type_bg, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type5
			,SUM(CASE WHEN ISNULL(a.i_type_contract, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type6
			,0 as i_product_type7
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
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type1
			,SUM(CASE WHEN ISNULL(a.i_product_type, 0) = 1  THEN 1 ELSE 0 END) AS i_product_type2
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 2  AND  ISNULL(a.i_product_type,0) = 0 AND ISNULL(a.i_type_bg,0) <> 2 THEN 1 ELSE 0 END) AS i_product_type3
			,SUM(CASE WHEN ISNULL(a.i_purchase, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type4
			,SUM(CASE WHEN ISNULL(a.i_type_bg, 0) = 2  THEN 1 ELSE 0 END) AS i_product_type5
			,SUM(CASE WHEN ISNULL(a.i_type_contract, 0) = 3  THEN 1 ELSE 0 END) AS i_product_type6
			,count(a.tor_id) as i_product_type7
			from sp_tor a 
			where   1=1 	{$where}
			-- and isnull(a.i_purchase,0) = 3 
			and a.i_enabled = 2 and c_code is not null 
			) a
			inner join sp_status_report b on b.sp_status_report_id =  a.sp_status_report_id and b.i_level = 2
			group by b.c_code,b.c_name,a.sp_status_report_id";
	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {
		$i = 0;
		$i_product_type1 = 0;
		$i_product_type2 = 0;
		$i_product_type3 = 0;
		$i_product_type4 = 0;
		$i_product_type5 = 0;
		$i_product_type6 = 0;
		$i_product_type7 = 0;
		$i_product_type8 = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp1 = array(

				"no"                	=> ++$i,
				"sp_status_report_id"   => intVal($row["sp_status_report_id"]),
				"c_code"         		=> intVal($row["c_code"]),
				"i_product_type1"    	=> intVal($row["i_product_type1"]),
				"i_product_type2"    	=> intVal($row["i_product_type2"]),
				"i_product_type3"    	=> intVal($row["i_product_type3"]),
				"i_product_type4"    	=> intVal($row["i_product_type4"]),
				"i_product_type5"    	=> intVal($row["i_product_type5"]),
				"i_product_type6"    	=> intVal($row["i_product_type6"]),
				"i_product_type7"    	=> intVal($row["i_product_type7"]),
				"i_product_type8"    	=> intVal($row["i_product_type8"]),
				"c_name"       			=> $row["c_name"],
			);
			${$root}[] = $temp1;
			$i_product_type1 	+= $row["i_product_type1"];
			$i_product_type2 	+= $row["i_product_type2"];
			$i_product_type3 	+= $row["i_product_type3"];
			$i_product_type4 	+= $row["i_product_type4"];
			$i_product_type5 	+= $row["i_product_type5"];
			$i_product_type6 	+= $row["i_product_type6"];
			$i_product_type7 	+= $row["i_product_type7"];
			$i_product_type8 += $row["i_product_type8"];
		}
	}
	return json_encode(array(
		"debug"							=> true,
		$root							=> ${$root},
		"no"							=> 9999,
		"i_product_type1"				=> $i_product_type1,
		"i_product_type2"				=> $i_product_type2,
		"i_product_type3"				=> $i_product_type3,
		"i_product_type4"				=> $i_product_type4,
		"i_product_type5"				=> $i_product_type5,
		"i_product_type6"				=> $i_product_type6,
		"i_product_type7"				=> $i_product_type7,
		"i_product_type8"				=> $i_product_type8,
		"year_th"                    	=> $yearTh,
		"year_en"                    	=> $yearEn,
		"totalCount"                    => $i,
	));
}
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
function List_ChartBg()
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
	$sqlMain = "SET NOCOUNT ON 
DECLARE @TEMP_SP_BG_BUDGET_SUM TABLE (
				i_year bigint
				,dc_expense_budget_type_id bigint
				,dc_cost_acc_id bigint
				,dc_cost_id bigint
				,bg_expense_id bigint
				,f_plan_begin decimal(18,2)
				,f_period_begin decimal(18,2)
				,f_income_begin decimal(18,2)
				,f_plan_transfer decimal(18,2) 
				,f_period_transfer decimal(18,2)
				,f_income_transfer decimal(18,2)
				,f_reserve_budget decimal(18,2)
				,f_reserve_budget_long decimal(18,2)
				,f_reserve_budget_income decimal(18,2)
				,f_reserve_budget_income_Finish decimal(18,2)
				,f_reserve_period decimal(18,2)
				,f_reserve_periodincome decimal(18,2)
				,f_reserve_periodfinish decimal(18,2)
				,f_reserve_income decimal(18,2)
				,f_reserve_income_Finish decimal(18,2)
				,f_total_all decimal(18,2)
				,f_return_all decimal(18,2)
				,f_total_cut decimal(18,2)
				,f_return_cut decimal(18,2)
				,f_total_pay decimal(18,2)
				,f_return_pay decimal(18,2)
				,f_plan_total decimal(18,2)
				,f_plan_cut_total decimal(18,2)
				,f_plan_pay_total decimal(18,2)
				,f_period_total decimal(18,2)
				,f_period_cut_total decimal(18,2)
				,f_period_pay_total decimal(18,2)
				,f_income_total decimal(18,2)
				,f_income_cut_total decimal(18,2)
				,f_income_pay_total decimal(18,2)
			); 
			INSERT INTO @TEMP_SP_BG_BUDGET_SUM EXEC NMU_EIS..SP_BG_BUDGET_SUM 2025
			
						select
                         *
						,(SELECT c_code  from  NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id  ) + ' : ' + a.c_name  as c_code_name
						,a.c_code
                        from 
                        (
						-- เงินตั้งต้น ของ รายได้ 
                        select 
						bg_expense_id
						,(SELECT c_code  from  NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id  )  as c_code
                        ,dc_expense_budget_type_id
						,(select c_name from NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id) as c_name 
                    	
						,f_plan_begin + f_plan_transfer as  f_plan_begin -- เงินโอนเปลี่ยนแปลง						
						,f_reserve_budget as f_reserve_budget
						,f_reserve_budget_income as f_reserve_budget_income
						,f_total_all-  f_return_all as f_reserve_budget_income_Finish

						,0  as f_period_transfer_bkb
                        ,0 as f_reserve_period_bkb
						,0 as f_reserve_periodincome_bkb
						,0 as f_reserve_periodfinish_bkb
							
                        ,0 as f_period_transfer_government
						,0 as f_reserve_period_government
						,0 as f_reserve_periodincome_government
						,0 as f_reserve_periodfinish_government

						from @TEMP_SP_BG_BUDGET_SUM a 						
						where i_year = 2025 
						and dc_cost_id = 38  and a.dc_cost_acc_id = 77 
			            AND a.dc_expense_budget_type_id = 2
                UNION ALL 
                     select 
					 	--เงินตั้งต้น ของ กทม 
						bg_expense_id
						,(SELECT c_code  from  NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id  )  as c_code
                        ,dc_expense_budget_type_id
						,(select c_name from NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id) as c_name 
						,0 as  f_plan_begin -- เงินโอนเปลี่ยนแปลง              	
						,0 as f_reserve_budget
						,0 as f_reserve_budget_income
						,0 as f_reserve_periodfinish

						,f_period_begin + f_period_transfer  as f_period_transfer_bkb
                        ,f_reserve_period as f_reserve_period_bkb
						,f_reserve_periodincome as f_reserve_periodincome_bkb
						,f_total_all-  f_return_all as f_reserve_periodfinish_bkb
						
                        ,0 as f_period_transfer_government
						,0  as f_reserve_period_government
						,0 as f_reserve_periodincome_government
						,0 as f_reserve_periodfinish_government
						from @TEMP_SP_BG_BUDGET_SUM a 						
						where i_year = 2025 
						and dc_cost_id = 38  and a.dc_cost_acc_id = 77 
                         AND a.dc_expense_budget_type_id = 4
                UNION ALL 
					 	--เงินตั้งต้น ของ อุดหนุน
                     select 
						bg_expense_id
						,(SELECT c_code  from  NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id  )  as c_code
                        ,dc_expense_budget_type_id
						,(select c_name from NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id) as c_name 
						,0 as  f_plan_begin -- เงินโอนเปลี่ยนแปลง              	
						,0 as f_reserve_budget
						,0 as f_reserve_budget_income
						,0 as f_reserve_periodfinish

						,0  as f_period_transfer_bkb
                        ,0 as f_reserve_period_bkb
						,0 as f_reserve_periodincome_bkb
						,0 as f_reserve_periodfinish_bkb

						,f_period_begin + f_period_transfer  as f_period_transfer_government
                        ,f_reserve_period as f_reserve_period_government
						,f_reserve_periodincome as f_reserve_periodincome_government
						,f_total_all -  f_return_all as f_reserve_periodfinish_government
						from @TEMP_SP_BG_BUDGET_SUM a 						
						where i_year = 2025 
						and dc_cost_id = 38  and a.dc_cost_acc_id = 77 
                         AND a.dc_expense_budget_type_id = 5
                        ) a
                        
						ORDER by a.c_code,a.bg_expense_id 


";
	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {
		$i = 0;
		$i_tor_type1 = 0;
		while ($row = $db->Fetch($stmt)) {
				$temp = array(                                            
				"no"                                        => ++$i,
				"name"                                      => $row["c_name"],
				"c_name"                                    => $row["c_code_name"],
				"bg_expense_id"                             => intVal($row["bg_expense_id"]),
				"dc_expense_budget_type_id"                 => intVal($row["dc_expense_budget_type_id"]),
				                                                                                                                                                                    
				"f_plan_begin"                              => intVal($row["f_plan_begin"]),   //f_plan_begin  เงินตั้งต้น รายได้ 
				"f_reserve_budget"                          => intVal($row["f_reserve_budget"]), //f_reserve_budget //เงินจอง PR  รายได้ 
				"f_reserve_budget_income"                   => intVal($row["f_reserve_budget_income"]), //f_reserve_budget //เงินจองตรวจรับ  รายได้  
				"f_reserve_budget_income_Finish"            => intVal($row["f_reserve_budget_income_Finish"]), //f_reserve_budget //เงินจองเบิกแล้ว  รายได้ 
                                                                                
                                            
				"f_plan_begin_remaining"                    => intVal($row["f_plan_begin"]) - 
				(intVal($row["f_reserve_budget"])  + intVal($row["f_reserve_budget_income"])  + intVal($row["f_reserve_budget_income_Finish"]) )  ,                                             
				// ตั้งต้น - จองแล้ว - ตรวจรับ - เบิกแล้ว   (เงินรวม รายได้)                                              
				                                            
				                                            
                            //   f_reserve_period_bkb                                                                                                  
				"f_period_transfer_bkb"                     => intVal($row["f_period_transfer_bkb"]), // f_period_transfer_bkb กทม  ตั้งต้น  
				"f_reserve_period_bkb"                      => intVal($row["f_reserve_period_bkb"]), // f_reserve_period_bkb  //เงินจอง PR  กทม
				"f_reserve_periodincome_bkb"                => intVal($row["f_reserve_periodincome_bkb"]), // f_reserve_period_bkb  //เงินจองตรวจรับ  กทม
				"f_reserve_periodfinish_bkb"                => intVal($row["f_reserve_periodfinish_bkb"]), // f_reserve_period_bkb  //เงินจองเบิกแล้ว    กทม
                                            
				"f_period_transfer_remaining_bkb"           => intVal($row["f_period_transfer_bkb"]) - 
				(intVal($row["f_reserve_period_bkb"])  + intVal($row["f_reserve_periodincome_bkb"]) +  intVal($row["f_reserve_periodfinish_bkb"]) )  ,                                             
				// ตั้งต้น - จองแล้ว - ตรวจรับ - เบิกแล้ว   (เงินรวม กทม)                                              
                                            
                                            
				"f_period_transfer_government"              => intVal($row["f_period_transfer_government"]), // ตั้งต้น  
				"f_reserve_period_government"               => intVal($row["f_reserve_period_government"]), // ใช้แล้ว
				"f_reserve_periodincome_government"         => intVal($row["f_reserve_periodincome_government"]), // ใช้แล้ว
				"f_reserve_periodfinish_government"         => intVal($row["f_reserve_periodfinish_government"]), // ใช้แล้ว
                                            
				"f_period_transfer_remaining_government"    => intVal($row["f_period_transfer_government"]) -
				(intVal($row["f_reserve_period_government"]) - intVal($row["f_reserve_periodincome_government"]) - intVal($row["f_reserve_periodfinish_government"]) ) , // ตั้งต้น - ใช้แล้ว                                             
				// ตั้งต้น - จองแล้ว - ตรวจรับ - เบิกแล้ว   (เงินรวม รัฐบาล)                                                                                          
                                            
// f_reserve_periodfinish 
			);
			${$root}[] = $temp;
			$i_tor_type1 	+= $row["bg_expense_id"];
			// $i_tor_type2 	+= $row["i_tor_type2"];
			// $i_tor_type3 	+= $row["i_tor_type3"];
			// $i_tor_type4 	+= $row["i_tor_type4"];
			// $i_tor_type5 	+= $row["i_tor_type5"];
			// $i_tor_type6 	+= $row["i_tor_type6"];
			// $i_product_type7 	+= $row["i_product_type7"];
			// $i_product_type8 += $row["i_product_type8"];
		}
	}
	// print_r($root);
	// exit;
	return json_encode(array(
		"debug"                 => true,
		$root					=> ${$root},
		"no"                    => 9999,
		// "i_tor_type1"           => $i_tor_type1,
		// "i_tor_type2"           => $i_tor_type2,
		// "i_tor_type3"           => $i_tor_type3,
		// "i_tor_type4"           => $i_tor_type4,
		// "i_tor_type5"           => $i_tor_type5,
		// "i_tor_type6"       	=> $i_tor_type6,
		// "i_product_type7"       => $i_product_type7,
		// "i_product_type8"       => $i_product_type8,
		"year_th"               => $yearTh,
		"year_en"               => $yearEn,
		"totalCount"            => $i,
	));
}
