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
	$yearTh = isset($_GET['year_th']) ? intval($_GET['year_th']) : (date('Y') + 543);
	$yearEn = isset($_GET['year_en']) ? intval($_GET['year_en']) : date('Y');
	$chart1 = [];
	$chart2 = [];
	$where = ' and  t.i_pr_year = ' . $yearEn;

	$sqlMain = "SET NOCOUNT ON;

					DECLARE @TEMP_SP_USER_COST_SYS TABLE (dc_cost_id BIGINT);
					INSERT INTO @TEMP_SP_USER_COST_SYS
					EXEC NMU_DATACENTER.dbo.SP_USER_COST_SYS 1,2,NULL,NULL;

					;WITH COST_MAIN AS (
						SELECT
								dc_cost_id        AS dc_cost_main_id
								,b.dc_cost_acc_id
								,c_name           AS cost_name
							FROM NMU_DATACENTER..dc_cost a
							INNER JOIN (
								SELECT
									LEFT(c_code,2) + '000000' AS c_code
									,MAX(b.dc_cost_acc_id)    AS dc_cost_acc_id
								FROM NMU_DATACENTER..dc_cost b
								WHERE 1=1
								GROUP BY LEFT(c_code,2) + '000000'
							) b ON a.c_code = b.c_code
					)
					SELECT
						cm.dc_cost_acc_id,
						cm.cost_name,
						t.tor_id,
						t.tor_status_id,
						CASE
							WHEN ISNULL(t.i_type_contract,0) = 1 THEN N'สัญญา'
							WHEN ISNULL(t.i_type_contract,0) = 2 THEN N'ใบสั่ง'
							WHEN ISNULL(t.i_type_contract,0) = 3 THEN N'จัดซื้อจะขาย'
							ELSE N'ยังไม่ได้ระบุ'
						END                                                                                         AS i_type_contract,
						( SELECT c_name FROM NMU_ERP..sp_tor_i_work_type WHERE i_work_type_id = ISNULL(t.i_product_type,0) ) AS i_product_type,
						t.i_yyyy + 543                                                                              AS i_yyyy,
						t.c_name,
						t.c_code                                                                                    AS pr_code,
						( SELECT c_name FROM NMU_ERP..sp_tor_i_work_type WHERE i_work_type_id = t.i_working_type )  AS i_working_type,
						( SELECT c_name FROM NMU_DATACENTER.dbo.dc_expense_budget_type WHERE dc_expense_budget_type_id = t.dc_expense_budget_type_id ) AS dc_expense_budget_type,
						( SELECT c_name FROM NMU_EIS.dbo.bg_expense WHERE bg_expense_id = t.po_expense_id )         AS po_expense,
						( SELECT c_name FROM EIS_PROCURE.dbo.sp_emp WHERE sp_emp_id = t.sp_emp_id )                 AS sp_emp,
						( SELECT c_name FROM EIS_PROCURE.dbo.sp_type_bg WHERE i_value = t.i_type_bg )               AS i_type_bg,
						ISNULL(t.tor_type_id, 0)                                                                    AS tor_type_id,
						t.f_total_amt,
						(
							SELECT COUNT(*)
							FROM EIS_PROCURE.dbo.sp_tor_contract sc2
							WHERE sc2.sp_tor_id = t.tor_id
						)                                                                                           AS contract_count,
						sp.contract_c_code,
						sp.bill_step,
						t.i_enabled
					FROM EIS_PROCURE.dbo.sp_tor t
					LEFT JOIN NMU_DATACENTER.dbo.dc_cost dc ON dc.dc_cost_id = t.dc_cost2_id
					LEFT JOIN COST_MAIN cm ON cm.dc_cost_acc_id = dc.dc_cost_acc_id
					OUTER APPLY (
						SELECT TOP 1
							c2.c_code AS contract_c_code,
							CASE
								WHEN ISNULL(f.i_status_last,0) >= 11 AND ISNULL(e.po_working_hdr_id,0) > 0 THEN 'PAID'
								WHEN ISNULL(e.po_working_hdr_id,0) = 0 AND e.c_code IS NOT NULL           THEN 'BILLING'
								WHEN c2.c_code IS NOT NULL                                                 THEN 'INSPECT'
								WHEN c2.c_code IS NULL AND t.tor_status_id IN (20,21,10034)                THEN 'MANAGE'
								ELSE 'PROCESS'
							END AS bill_step
						FROM EIS_PROCURE.dbo.sp_tor_contract c2
						LEFT JOIN EIS_PROCURE.dbo.sp_tor_hdr_period d
							ON  d.sp_tor_contract_id = c2.sp_tor_contract_id
							AND d.i_is_last = 1
						LEFT JOIN EIS_PROCURE.dbo.sp_check_period_hdr e
							ON  e.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id
						LEFT JOIN NMU_EIS..po_working_hdr f
							ON  f.po_working_hdr_id = e.po_working_hdr_id
						WHERE c2.sp_tor_id = t.tor_id
					) sp
					WHERE 1 = 1 {$where}
						AND (
							t.tor_status_id IN (24,25,26,13)
							OR t.tor_status_id IN (1,11,12,14,15,16,17,18,19,20,22,23,28,29,30,31)
							OR t.tor_status_id IN (21,10034)
						)
						AND t.c_code IS NOT NULL
					";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {
		$i = 0;
		$i_tor_type6 = 0;
		while ($row = $db->Fetch($stmt)) {
			$status_group = 0;
			$tor_status   = $row["tor_status_id"];
			$bill_step    = $row["bill_step"];
			$enabled      = $row["i_enabled"];

			// ถ้า OUTER APPLY คืน NULL (ไม่มีสัญญาเลย) ให้กำหนด bill_step จาก tor_status_id
			if (is_null($bill_step) || $bill_step === '') {
				$bill_step = in_array($tor_status, [20, 21, 10034]) ? 'MANAGE' : 'PROCESS';
			}

			if ($enabled == 2) {
				$status_group = 9;  // ยกเลิก → อยู่ระหว่างดำเนินการ
			} elseif (in_array($tor_status, [24, 25, 26, 13])) {
				$status_group = 8;  // รอดำเนินการ
			} elseif ($bill_step == 'PAID') {
				$status_group = 13; // เบิกจ่ายเงินแล้ว ← ต้องมาก่อน MANAGE
			} elseif ($bill_step == 'BILLING') {
				$status_group = 12; // ขออนุมัติเบิกจ่าย
			} elseif ($bill_step == 'INSPECT') {
				$status_group = 11; // ตรวจรับพัสดุ
			} elseif (in_array($tor_status, [20, 21, 10034]) || $bill_step == 'MANAGE') {
				$status_group = 10; // ลงนามในสัญญา ← มาหลัง PAID/BILLING/INSPECT
			} else {
				$status_group = 9;  // อยู่ระหว่างดำเนินการ
			}

			// สำเร็จ = เบิกจ่ายเงินแล้ว (status_group = 13)
			$process_status = ($status_group == 13) ? 'สำเร็จ' : 'รอดำเนินการ';

			$temp1 = array(
				"dc_cost_acc_id"         => intVal($row["dc_cost_acc_id"]),
				"cost_name"              => $row["cost_name"],
				"pr_code"                => $row["pr_code"],
				"contract_c_code"        => $row["contract_c_code"],
				"i_product_type"         => $row["i_product_type"],
				"i_type_contract"        => $row["i_type_contract"],
				"i_product_type_name"    => $row["i_product_type"],
				"tor_status_id"          => intVal($row["tor_status_id"]),
				"i_yyyy"                 => $row["i_yyyy"],
				"c_name"                 => $row["c_name"],
				"i_working_type"         => $row["i_working_type"],
				"dc_expense_budget_type" => $row["dc_expense_budget_type"],
				"po_expense"             => $row["po_expense"],
				"sp_emp"                 => $row["sp_emp"],
				"i_type_bg"              => $row["i_type_bg"],
				"status_group_id"        => $status_group,
				"process_status"         => $process_status,
				"contract_count"         => intVal($row["contract_count"]),
				"tor_type_id"            => intVal($row["tor_type_id"]),
				"total_amt"              => floatVal($row["f_total_amt"]),
			);
			${$root}[] = $temp1;
			$i++;
			$i_tor_type6++;
		}
	}

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
		"debug"      => true,
		$root        => sanitize_recursive(${$root}),
		"totalCount" => $i,
		"year_th"    => $yearTh,
		"year_en"    => $yearEn
	);

	return json_encode($final_data, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);
}