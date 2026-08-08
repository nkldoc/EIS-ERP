<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;
	$totalCount = 0;
	$type = $_REQUEST["type"] ?? 0;
	$start = $_REQUEST["start"] ?? 0;
	$i_tor_type = $_REQUEST["chart"] ?? 0;

	// ---- parameters ----
	$year_en                    = intval(@$_REQUEST["year_en"]);
	$dc_expense_budget_type_id  = intval(@$_REQUEST["dc_expense_budget_type_id"]);
	$bg_expense_id              = intval(@$_REQUEST["bg_expense_id"]);
	$dc_cost_acc_id             = intval(@$_REQUEST["dc_cost_acc_id"]);
	$budget_mode                = in_array(@$_REQUEST["budget_mode"], ["plan","period"]) ? $_REQUEST["budget_mode"] : "";

	$detailMap = [];

	// ---- WHERE สำหรับ #temp_1 (bg_reserve_money) ----
	$whereTemp1 = "";
	if ($year_en > 0) {
		$whereTemp1 .= " AND a.i_year = {$year_en} ";
	}
	// กำหนด i_pr_type จาก budget_mode ก่อน ถ้าไม่มีค่อย fallback ตาม dc_expense_budget_type_id
	if ($budget_mode === "period") {
		$whereTemp1 .= " AND a.i_pr_type = 2 ";
		if ($dc_expense_budget_type_id > 0) {
			$whereTemp1 .= " AND a.dc_budget_type_id = {$dc_expense_budget_type_id} ";
		}
	} elseif ($budget_mode === "plan") {
		$whereTemp1 .= " AND a.i_pr_type = 1 ";
		if ($dc_expense_budget_type_id > 0) {
			$whereTemp1 .= " AND a.dc_budget_type_id = {$dc_expense_budget_type_id} ";
		}
	} elseif ($dc_expense_budget_type_id > 0) {
		if (in_array($dc_expense_budget_type_id, [4, 5])) {
			$whereTemp1 .= " AND a.i_pr_type = 2 ";
		} else {
			$whereTemp1 .= " AND a.i_pr_type = 1 ";
		}
		$whereTemp1 .= " AND a.dc_budget_type_id = {$dc_expense_budget_type_id} ";
	}
	if ($bg_expense_id > 0) {
		$whereTemp1 .= " AND a.bg_expense_id = {$bg_expense_id} ";
	}
	if ($dc_cost_acc_id > 0) {
		$whereTemp1 .= " AND a.dc_cost_acc_id = {$dc_cost_acc_id} ";
	}

	// ---- WHERE สำหรับ SELECT สุดท้าย (join กับ sp_Tor) ----
	$whereFinal = "";
	$sqlMain = "SET NOCOUNT ON 
					SELECT
							i_sys
							, i_pr_type
							, i_year
							, dc_cost_acc_id
							, dc_cost_id
							, pr_id
							, po_id
							, chk_id
							, dc_budget_type_id
							, bg_expense_id
							, i_reserve
							, i_finish
							, MAX(MAX(ISNULL(i_last,0))) OVER (PARTITION by i_sys,pr_id,po_id,chk_id) AS i_success
							, MAX(MAX(i_reserve)) OVER (PARTITION by pr_id) AS i_reserve_max
							, CASE WHEN MAX(MAX(ISNULL(i_last,0))) OVER (PARTITION by pr_id,i_reserve) = 1 THEN i_reserve ELSE 0 END AS i_last
							, SUM(f_amt) AS f_amt
						INTO #temp_1
						FROM NMU_EIS..bg_reserve_money a
						WHERE i_enable = 1
						{$whereTemp1}
						GROUP BY i_sys, i_pr_type, i_year, dc_cost_acc_id, dc_cost_id, pr_id, po_id, chk_id, i_reserve, i_finish, dc_budget_type_id, bg_expense_id

						SELECT *
							, CASE 
								WHEN i_reserve = 2 
									THEN CASE WHEN (SELECT TOP 1
								aa.i_last
							FROM #temp_1 aa
							WHERE a.i_sys = aa.i_sys AND aa.pr_id = a.pr_id AND aa.po_id = a.po_id AND aa.i_pr_type = a.i_pr_type AND i_last = 3 AND i_success = 1) = 3 THEN 3 ELSE 2 END
								ELSE MAX(i_last) OVER (PARTITION by pr_id)  
							END AS i_last_max
							, CASE 
								WHEN i_reserve = 1  THEN (SELECT ISNULL(SUM(f_amt),0)
							FROM #temp_1 aa
							WHERE  a.i_sys = aa.i_sys AND aa.pr_id = a.pr_id AND aa.dc_budget_type_id = a.dc_budget_type_id AND aa.bg_expense_id = a.bg_expense_id AND i_reserve = 3)
								WHEN i_reserve = 2  THEN (SELECT ISNULL(SUM(f_amt),0)
							FROM #temp_1 aa
							WHERE  a.i_sys = aa.i_sys AND aa.pr_id = a.pr_id AND aa.po_id = a.po_id AND aa.dc_budget_type_id = a.dc_budget_type_id AND aa.bg_expense_id = a.bg_expense_id AND i_reserve = 3)
							ELSE 0
						END AS f_amt_pay
						INTO #temp_2
						FROM #temp_1 a

						SELECT
							i_sys
							, i_pr_type
							, i_year
							, dc_cost_acc_id
							, dc_cost_id
							, pr_id
							, po_id
							, chk_id
							, dc_budget_type_id AS dc_expense_budget_type_id
							, bg_expense_id
							, i_reserve
							, i_finish
							, i_last
							, ISNULL(f_amt,0) - ISNULL(f_amt_pay,0) AS f_amt
						INTO #temp_bg_reserve_money
						FROM #temp_2 a
						WHERE i_last = i_last_max
							OR i_reserve = 3
							OR i_last = (
								SELECT
								CASE
										WHEN COUNT(*) < 1 THEN 1
										ELSE 3
									END
							FROM #temp_2 aa
							WHERE i_last = 2
								AND aa.i_sys = a.i_sys
								AND aa.pr_id = a.pr_id
								AND aa.i_pr_type = a.i_pr_type
								AND aa.dc_budget_type_id = a.dc_budget_type_id 
							)
						select 
						-- *
						a.i_sys
						,a.pr_id
						,a.f_amt
						,a.bg_expense_id
						,a.dc_expense_budget_type_id
						,(select c_name from NMU_EIS..bg_expense where bg_expense_id = a.bg_expense_id) as bg_expense
						,(select c_name from " . DB_CENTER . "dc_expense_budget_type where dc_expense_budget_type_id = a.dc_expense_budget_type_id) as dc_expense_budget_type
						,a.dc_cost_id
						,(select c_name from " . DB_CENTER . "dc_cost where dc_cost_id =   b.dc_cost_id) as dc_cost
						,(select c_name from " . DB_CENTER . "dc_cost where dc_cost_id =   b.dc_cost2_id) as dc_cost_id2
						,b.txtsub_cost as dc_sub_cost
						,(select c_name from EIS_PROCURE..sp_emp where sp_emp_id = b.sp_emp_id ) as sp_emp 
    					,(select c_name from EIS_PROCURE..sp_status_hdr where sp_status_hdr_id = b.tor_status_id ) as sp_status_hdr
    					,(select c_name from EIS_PROCURE..sp_department where dc_department_id = b.dc_department_id ) as dc_department

						,b.c_name
						,b.c_code
						, (Select c_name from  NMU_ERP..sp_type_event ac where ac.sp_type_event_id =  
                                    (SELECT TOP 1 event_type from  NMU_ERP..sp_tor_event where sp_tor_id = b.tor_id 
                                    ORDER BY d_create desc )) as event_type 
                            , (SELECT TOP 1 event_detail from  NMU_ERP..sp_tor_event where sp_tor_id = b.tor_id ORDER BY d_create desc ) as sp_event_detail 
						from #temp_bg_reserve_money a
						inner join EIS_PROCURE..sp_Tor b on a.pr_id = b.tor_id 
						where 1 = 1
						and a.i_reserve != 3 
						and a.i_sys = 3
						{$whereFinal}

						-- ====== ยอดรวมงบประมาณ / จอง / คงเหลือ (ตรงกับ DataView) ======
						DECLARE @TEMP_SP_BG_BUDGET_SUM TABLE (
							i_year bigint, dc_expense_budget_type_id bigint, dc_cost_acc_id bigint,
							dc_cost_id bigint, bg_expense_id bigint,
							f_plan_begin decimal(18,2), f_period_begin decimal(18,2), f_income_begin decimal(18,2),
							f_plan_transfer decimal(18,2), f_period_transfer decimal(18,2), f_income_transfer decimal(18,2),
							f_reserve_budget decimal(18,2), f_reserve_budget_long decimal(18,2),
							f_reserve_budget_income decimal(18,2), f_reserve_budget_income_Finish decimal(18,2),
							f_reserve_period decimal(18,2), f_reserve_periodincome decimal(18,2),
							f_reserve_periodfinish decimal(18,2), f_reserve_income decimal(18,2),
							f_reserve_income_Finish decimal(18,2), f_total_all decimal(18,2),
							f_return_all decimal(18,2), f_total_cut decimal(18,2), f_return_cut decimal(18,2),
							f_total_pay decimal(18,2), f_return_pay decimal(18,2),
							f_plan_total decimal(18,2), f_plan_cut_total decimal(18,2), f_plan_pay_total decimal(18,2),
							f_period_total decimal(18,2), f_period_cut_total decimal(18,2), f_period_pay_total decimal(18,2),
							f_income_total decimal(18,2), f_income_cut_total decimal(18,2), f_income_pay_total decimal(18,2)
						)
						INSERT INTO @TEMP_SP_BG_BUDGET_SUM
						EXEC NMU_EIS..SP_BG_BUDGET_SUM {$year_en}

						SELECT
							s.dc_expense_budget_type_id
							,s.bg_expense_id
							, CASE WHEN s.dc_expense_budget_type_id IN (4,5)
								THEN SUM(s.f_period_begin) + SUM(s.f_period_transfer)
								ELSE SUM(s.f_plan_begin)  + SUM(s.f_plan_transfer)
							END AS f_budget_total
							, CASE WHEN s.dc_expense_budget_type_id IN (4,5)
								THEN SUM(s.f_reserve_period) + SUM(s.f_reserve_periodincome) + SUM(s.f_reserve_periodfinish)
								ELSE SUM(s.f_reserve_budget) + SUM(s.f_reserve_budget_income) + SUM(s.f_reserve_budget_income_Finish)
							END AS f_reserve_total
						FROM @TEMP_SP_BG_BUDGET_SUM s
						WHERE s.i_year = {$year_en}
						AND s.dc_cost_id = 8
						" . ($dc_expense_budget_type_id > 0 ? " AND s.dc_expense_budget_type_id = {$dc_expense_budget_type_id} " : "") . "
						" . ($bg_expense_id > 0 ? " AND s.bg_expense_id = {$bg_expense_id} " : "") . "
						GROUP BY s.dc_expense_budget_type_id, s.bg_expense_id
";
	$stmt = $db->QueryParam($sqlMain, array());
	if (@$_REQUEST["show_sql"]) {
		/******echo sql******/
		$sql = (@$sqlMain) ? $sqlMain : $sql;
		$arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

		$sql = str_replace('?', '#-#', $sql);
		foreach ($arr as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
		/********************/
	}
	if ($stmt) {
		$no = 0;
		$f_total_amt = 0;
		// ---- Result Set 1: รายการ PR ----
		while ($row = $db->Fetch($stmt)) {
			$sp_tor_id = $row['pr_id'];
			$temp = array(
				"i_type"                            => 1,
				"no"                                => ++$no,
				"tor_id"                            => $sp_tor_id,
				"sp_tor_id"                         => $row["pr_id"],
				"c_code"                            => $row["c_code"],
				"c_name"                            => $row["c_name"],
				"sp_emp"                            => $row["sp_emp"],
				"sp_status_hdr"                     => $row["sp_status_hdr"],
				"dc_department"                     => $row["dc_department"],
				"dc_cost"                           => $row["dc_cost"],
				"dc_sub_cost"                       => $row["dc_sub_cost"],
				"dc_cost_id2"                       => $row["dc_cost_id2"],
				"bg_expense"                        => $row["bg_expense"],
				"bg_expense_id"                     => $row["bg_expense_id"],
				"dc_expense_budget_type_id"         => $row["dc_expense_budget_type_id"],
				"dc_expense_budget_type"            => $row["dc_expense_budget_type"],
				"event_type"                        => $row["event_type"],
				"sp_event_detail"                   => $row["sp_event_detail"],
				"f_amt"                             => (float) $row["f_amt"],
				"children"                          => isset($detailMap[$sp_tor_id]) ? $detailMap[$sp_tor_id] : [],
			);
			${$root}[] = $temp;
			$f_total_amt += (float)$row["f_amt"];
		}

		// ---- Result Set 2: ยอดรวมงบประมาณจาก SP_BG_BUDGET_SUM ----
		$f_budget_total  = 0;
		$f_reserve_total = 0;
		if ($db->NextResult($stmt)) {
			while ($rowBg = $db->Fetch($stmt)) {
				$f_budget_total  += (float)$rowBg["f_budget_total"];
				$f_reserve_total += (float)$rowBg["f_reserve_total"];
			}
		}
		$f_remaining = $f_budget_total - $f_reserve_total;
		$totalCount = $no;
	}

	return json_encode(array(
		"debug"             => true,
		"totalCount"        => $totalCount,
		$root               => ${$root},
		"f_budget_total"    => $f_budget_total,
		"f_reserve_total"   => $f_reserve_total,
		"f_remaining"       => $f_remaining,
		"f_pr_total"        => $f_total_amt,
	));
}