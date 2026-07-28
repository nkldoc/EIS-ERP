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
	if (isset($_GET['year_en'])) {
		$yearEn = intval($_GET['year_en']);
	} else {
		$yearEn = $yearTh - 543;
	}
	$chart1 = [];  // ดึงข้อมูลชุดแรก
	$chart2 = [];  // ดึงข้อมูลชุดที่สอง
	$where = ' and  t.i_pr_year = ' . $yearEn;
	// 
	$sqlMain = "SET NOCOUNT ON;
					----------------------------------------------------
					-- 1) สร้าง CTE หน่วยงานหลัก
					----------------------------------------------------
					DECLARE @TEMP_SP_USER_COST_SYS TABLE (dc_cost_id BIGINT);
					INSERT INTO @TEMP_SP_USER_COST_SYS
					EXEC NMU_DATACENTER.dbo.SP_USER_COST_SYS 1,2,NULL,NULL;

					;WITH COST_MAIN AS (
						select
								dc_cost_id as dc_cost_main_id
								,b.dc_cost_acc_id 
								,c_name as cost_name
							from  NMU_DATACENTER..dc_cost a 
							inner join (
							select 
								left(c_code,2) + '000000'  as c_code
								,max(b.dc_cost_acc_id) as dc_cost_acc_id
							from  NMU_DATACENTER..dc_cost b 
							where 1=1 
							group by left(c_code,2) + '000000'
							) b on a.c_code  = b.c_code
					)
					----------------------------------------------------
					-- 2) ดึงข้อมูลดิบ (Raw Data)
					----------------------------------------------------
					SELECT 
						cm.dc_cost_acc_id,
						cm.cost_name,
						t.tor_id,
						t.tor_status_id,
						
						--t.i_product_type  ,
                        case when  isnull(t.i_type_contract,0) = 1  then 'สัญญา'  when  isnull(t.i_type_contract,0) = 2 then 'ใบสั่ง' when  isnull(t.i_type_contract,0) = 3 then 'จัดซื้อจะขาย'
                        else 'ยังไม่ได้ระบุ' end as i_type_contract ,
                        ( select c_name from NMU_ERP..sp_tor_i_work_type where i_work_type_id =  isnull(t.i_product_type,0)  ) as i_product_type  , 
						t.tor_status_id,
                        t.i_yyyy +543 as i_yyyy,
						t.c_name,
						t.c_code  as pr_code , 
						c.c_code as contract_c_code,
                        ( select c_name from NMU_ERP..sp_tor_i_work_type where i_work_type_id =  t.i_working_type  ) as i_working_type  , 
                        (select c_name from NMU_DATACENTER.dbo.dc_expense_budget_type where dc_expense_budget_type_id = t.dc_expense_budget_type_id ) as dc_expense_budget_type ,
                        (select c_name from NMU_EIS.dbo.bg_expense where bg_expense_id = t.po_expense_id ) as po_expense,
                        (select c_name from sp_emp where sp_emp_id = t.sp_emp_id ) as sp_emp ,
                        (Select   c_name from sp_type_bg where i_value = t.i_type_bg ) as i_type_bg, 


						ISNULL(t.tor_type_id, 0) as tor_type_id,
						t.f_total_amt,
						sp.contract_c_code, -- รหัสสัญญา (ถ้ามี)
						sp.bill_step,        -- ขั้นตอนการเบิกจ่าย (po_working_hdr_id, i_status_last ฯลฯ)
						t.i_enabled
					FROM sp_tor t
					LEFT JOIN NMU_DATACENTER.dbo.dc_cost dc ON dc.dc_cost_id = t.dc_cost2_id 
					LEFT JOIN COST_MAIN cm ON cm.dc_cost_acc_id = dc.dc_cost_acc_id
					LEFT JOIN sp_tor_contract c ON c.sp_tor_id = t.tor_id

					-- JOIN เพื่อเช็คสถานะสัญญาและการเบิกจ่าย (รวม Logic จาก Query เดิม)
					OUTER APPLY (
						SELECT TOP 1 
							c.c_code as contract_c_code,
							CASE 
								-- เบิกจ่ายเงินแล้ว (เงื่อนไข 6)
								WHEN isnull(f.i_status_last,0) >= 11 AND isnull(e.po_working_hdr_id,0) > 0 THEN 'PAID'
								-- ขออนุมัติเบิกจ่าย (เงื่อนไข 5)
								WHEN isnull(e.po_working_hdr_id,0) = 0 AND e.c_code is NOT null THEN 'BILLING'
								-- ตรวจรับ (เงื่อนไข 4)
								WHEN c.c_code IS NOT NULL THEN 'INSPECT'
								-- บริหารสัญญา (เงื่อนไข 3)
								WHEN c.c_code IS NULL AND t.tor_status_id IN (20,21,10034) THEN 'MANAGE'
								ELSE 'PROCESS'
							END as bill_step
						FROM sp_tor_contract c
						LEFT JOIN sp_tor_contract  cs ON cs.sp_tor_contract_id = c.sp_tor_contract_id -- เผื่อมี logic split
						LEFT JOIN  sp_tor_hdr_period d on d.sp_tor_contract_id = c.sp_tor_contract_id and d.i_is_last = 1
						LEFT JOIN  sp_check_period_hdr e on e.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id 
						LEFT JOIN NMU_EIS..po_working_hdr f on e.po_working_hdr_id = f.po_working_hdr_id 
						WHERE c.sp_tor_id = t.tor_id
					) sp

					WHERE 1 = 1 {$where}
						-- รวมเงื่อนไข Status ทั้งหมดจาก Query เดิม
						AND (
							-- 1. รอดำเนินการ
							t.tor_status_id IN (24,25,26,13) 
							
							-- 2. อยู่ระหว่างดำเนินการ
							OR t.tor_status_id IN (1,11,12,14,15,16,17,18,19,20,22,23,28,29,30,31)

							-- 3,4,5,6 บริหารสัญญา -> เบิกจ่าย
							OR t.tor_status_id IN (20,21,10034)
						)
						AND t.c_code IS NOT NULL
						-- AND t.i_enabled = 1 -- (เงื่อนไข i_enabled อาจต่างกันในแต่ละ Case แต่ส่วนใหญ่เป็น 1, ยกเว้น 'ยกเลิก' เป็น 2)
					";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {
		$i = 0;
		$i_tor_type6 = 0; // Initialize sum counter for backward compatibility
		while ($row = $db->Fetch($stmt)) {
			// Logic จำแนกกลุ่ม (Classification) เลียนแบบ Query เดิม
			$status_group = 0;
			$tor_status = $row["tor_status_id"];
			$bill_step = $row["bill_step"];
			$enabled = $row["i_enabled"];

			if ($enabled == 2) {
				$status_group = 9; // ยกเลิก
			} else if (in_array($tor_status, [24, 25, 26, 13])) {
				$status_group = 8; // รอดำเนินการ
			} else if ($bill_step == 'PAID') {
				$status_group = 13; // เบิกจ่ายแล้ว
			} else if ($bill_step == 'BILLING') {
				$status_group = 12; // ขออนุมัติเบิกจ่าย
			} else if ($bill_step == 'INSPECT') {
				$status_group = 11; // ตรวจรับ
			} else if ($bill_step == 'MANAGE') {
				$status_group = 10; // บริหารสัญญา
			} else {
				$status_group = 9; // อยู่ระหว่างดำเนินการ (Process)
			}

			$temp1 = array(
				"dc_cost_acc_id"            => intVal($row["dc_cost_acc_id"]),
				"cost_name"                 => $row["cost_name"],
				"pr_code"                   => $row["pr_code"],
				"contract_c_code"           => $row["contract_c_code"],
				"i_product_type"            => $row["i_product_type"],
				"i_type_contract"           => $row["i_type_contract"],
				// "i_product_type_name"       => $row["i_product_type_name"],
				"tor_status_id"             => $row["tor_status_id"],
				"i_yyyy"                    => $row["i_yyyy"],
				"c_name"                    => $row["c_name"],
				"i_working_type"            => $row["i_working_type"],
				"dc_expense_budget_type"    => $row["dc_expense_budget_type"],
				"po_expense"                => $row["po_expense"],
				"sp_emp"                    => $row["sp_emp"],
				"i_type_bg"                 => $row["i_type_bg"],
				"status_group_id"           => $status_group,
				"tor_type_id"               => intVal($row["tor_type_id"]),
				"total_amt"                 => floatVal($row["f_total_amt"]),

			);
			${$root}[] = $temp1;
			$i++;

			// Compute summary for compatibility (Optional, if frontend expects these)
			$i_tor_type6++;
		}
	}



	// Helper function to recursively sanitize strings
	function sanitize_recursive($data)
	{
		if (is_array($data)) {
			foreach ($data as $key => $value) {
				$data[$key] = sanitize_recursive($value);
			}
			return $data;
		} elseif (is_string($data)) {
			return preg_replace('/[\x00-\x1F\x7F]/u', '', $data);
		}
		return $data;
	}

	$final_data = array(
		"debug" => true,
		$root => sanitize_recursive(${$root}),
		"totalCount" => $i,
		"year_th" => $yearTh,
		"year_en" => $yearEn
	);

	return json_encode($final_data, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);
}
