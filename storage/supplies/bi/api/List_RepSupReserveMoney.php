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

	$i_year = $_REQUEST["i_year"] ?? "";

	// [FIX] ปีงบประมาณไทยเริ่ม 1 ต.ค. ของปี (ค.ศ. i_year - 1) ถึง 30 ก.ย. ของปี (ค.ศ. i_year)
	// เดิมพึ่งพา d_date_start/d_date_end ที่หน้าเรียกใช้ส่งมาเพียงอย่างเดียว ถ้าหน้านั้นส่งมาแบบ
	// ปีปฏิทิน (1 ม.ค. - 31 ธ.ค.) จะทำให้ข้อมูลเบิกจ่ายช่วง ต.ค.-ธ.ค. ของปีก่อนหน้าหายไปจาก
	// รายงาน "เบิกจ่ายแล้ว" (case 2, 3) จึงคำนวณช่วงปีงบประมาณที่ถูกต้องไว้เป็นค่า fallback
	// และดึงจุดเริ่มต้นกลับมาเป็นต้นปีงบประมาณเสมอ หากค่าที่ส่งมาเริ่มช้ากว่าที่ควร
	$fiscal_year_start = "";
	$fiscal_year_end   = "";
	if (!empty($i_year) && is_numeric($i_year)) {
		$fiscal_year_start = ($i_year - 1) . "-10-01";
		$fiscal_year_end   = $i_year . "-09-30";
	}

	$d_date_start = $_REQUEST["d_date_start"] ?? $fiscal_year_start;
	$d_date_end   = $_REQUEST["d_date_end"] ?? $fiscal_year_end;

	// ถ้าค่าที่ส่งมาเริ่มหลังต้นปีงบประมาณ (เช่นถูกตั้งเป็นปีปฏิทินโดยไม่ตั้งใจ) ให้ดึงกลับไปเป็น
	// ต้นปีงบประมาณเสมอ เพื่อไม่ให้ข้อมูล 3 เดือนแรกของปีงบ (ต.ค.-ธ.ค. ปีก่อนหน้า) หายไป
	if ($fiscal_year_start != "" && $d_date_start > $fiscal_year_start) {
		$d_date_start = $fiscal_year_start;
	}

	// [FIX] ทุก case ตอนนี้ query จาก #temp_bg_reserve_money (สร้างจาก EXEC SP_BG_RESERVE_MONEY) เหมือนกันหมด
	// ซึ่งมีคอลัมน์ dc_expense_budget_type_id ชื่อเดียวกันทุก case จึงไม่ต้องแยกเงื่อนไขตาม i_reserve อีกต่อไป
$budget1 = "";
if (!empty($_REQUEST["dc_expense_budget_type_id"])) {
	$bg_type_val = $_REQUEST["dc_expense_budget_type_id"];
	$budget1 = (strpos($bg_type_val, ',') !== false)
		? " AND a.dc_expense_budget_type_id IN ({$bg_type_val})"
		: " AND a.dc_expense_budget_type_id = {$bg_type_val}";
}	$i_pr_type = (isset($_REQUEST["i_pr_type"]) && $_REQUEST["i_pr_type"] == 2) ? " AND a.i_pr_type = 2" : "";
	$cost1 = (!empty($_REQUEST["dc_cost_id"])) ? " AND a.dc_cost_id = {$_REQUEST["dc_cost_id"]}" : "";

	// [FIX] พารามิเตอร์ dc_cost_acc_id ที่ URL ส่งมามักผิด (ส่งค่าเดียวกับ dc_cost_id ซ้ำ)
	// ค่า dc_cost_acc_id ที่ถูกต้องจริงๆ ต้อง lookup จากตาราง dc_cost โดยอิงจาก dc_cost_id
	// (ตาราง dc_cost มีคอลัมน์ dc_cost_acc_id เก็บรหัสหน่วยงานแม่ของแต่ละ dc_cost_id ไว้อยู่แล้ว)
	// ถ้ามี dc_cost_id ส่งมา ให้ derive ค่าที่ถูกต้องจากตรงนี้เสมอ แทนการเชื่อค่าจาก URL ตรงๆ
	$dc_cost_acc_id_lookup = "";
	if (!empty($_REQUEST["dc_cost_id"])) {
		$dc_cost_acc_id_lookup = $db->GetDataBySQL("SELECT dc_cost_acc_id FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = ?", array($_REQUEST["dc_cost_id"], 4));
	}
	if (!empty($dc_cost_acc_id_lookup)) {
		$dc_cost_acc1 = " AND a.dc_cost_acc_id = {$dc_cost_acc_id_lookup}";
	} else {
		$dc_cost_acc1 = (!empty($_REQUEST["dc_cost_acc_id"])) ? " AND a.dc_cost_acc_id = {$_REQUEST["dc_cost_acc_id"]}" : "";
	}



	$i_expense = $_REQUEST["i_expense"] ?? "";
	if ($i_expense == 1) {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv1"] ?? "");
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND c.bg_expense_lv1_id IN (" . $in . ")" : "";
			}
		}
	} else if ($i_expense == 2) {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv2"] ?? "");
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND c.bg_expense_lv2_id IN (" . $in . ")" : "";
			}
		}
	} else if ($i_expense == 3) {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv3"] ?? "");
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND c.bg_expense_lv3_id IN (" . $in . ")" : "";
			}
		}
	} else {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv4"] ?? "");
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND c.bg_expense_lv4_id IN (" . $in . ")" : "";
			}
		}
	}

	$i_level = $_REQUEST["i_level"] ?? "";
	$bg_expense_id = $_REQUEST["bg_expense_id"] ?? "0";
	// [FIX] bg_expense_id = 0 หมายถึง "เลือกทั้งหมด" ไม่ใช่ id จริง
	// ถ้าเอาไปเทียบ c.bg_expense_lv{i_level}_id = 0 ตรงๆ จะไม่มีแถวไหน match เลย (INNER JOIN กรองทิ้งหมด)
	// จึงต้องข้ามเงื่อนไขนี้ไปเมื่อเป็น 0 (ไม่กรอง = แสดงทุกหมวด)
	$bg_expense_join_cond = (!empty($bg_expense_id) && $bg_expense_id != 0)
		? " AND c.bg_expense_lv{$i_level}_id = {$bg_expense_id}"
		: "";

	switch ($_REQUEST["i_reserve"] ?? "") {
		case 1:
			$sqlMain = "
				SET NOCOUNT ON

				CREATE TABLE #temp_bg_reserve_money(
					i_sys bigint
					,i_pr_type tinyint
					,i_year bigint
					,dc_cost_acc_id bigint
					,dc_cost_id bigint
					,pr_id bigint
					,po_id bigint
					,chk_id bigint
					,dc_expense_budget_type_id bigint
					,bg_expense_id bigint
					,d_create datetime
					,i_reserve tinyint
					,i_finish tinyint
					,i_last int
					,f_amt decimal(18, 2)
				)
				INSERT INTO #temp_bg_reserve_money EXEC " . DB_NMU_EIS . "SP_BG_RESERVE_MONEY

				SELECT 
					--a.i_sys
					case a.i_sys 
					when 1 then 'ระบบจัดซื้อจัดจ้างและบริหารพัสดุ'
					when 2 then 'ระบบ ERP'
					when 3 then 'ระบบ EIS_PROCURE'
					else null
					end as sys_name
					,e.c_name AS dc_cost_name
					--,a.i_pr_type
					,case a.i_pr_type 
						when 1 then 'งบประมาณตามบัญชีจัดสรร'
						when 2 then 'เงินประจำงวด'
						else null
					end as pr_type_name
					--,a.i_reserve 
					--,a.i_year
					--,a.pr_id
					--,a.po_id
					--,a.chk_id
					--,a.dc_cost_id
					--,a.dc_expense_budget_type_id
					,d.c_name AS dc_expense_budget_type_name
					,(select aa.c_code + ' : ' + aa.c_name from " . DB_NMU_EIS . "bg_expense aa where aa.bg_expense_id = a.bg_expense_id) as bg_expense_name
					--,a.bg_expense_id
					--,a.i_finish
					--,a.i_last
					--,b.f_amt AS f_amt_in

					,sp_pr.pr_c_code
					,sp_pr.pr_d_doc_ref
					,sp_pr.pr_c_name

					,sp_pr.type_bg_name

					,sp_po.po_c_code
					,a.f_amt
					,CONVERT(VARCHAR(10),(SELECT TOP 1 aa.d_create FROM " . DB_NMU_EIS . "bg_reserve_money aa WHERE aa.pr_id = a.pr_id and aa.i_sys = a.i_sys ORDER BY aa.d_create),120) AS d_create
				FROM #temp_bg_reserve_money a
				INNER JOIN " . DB_NMU_EIS . "vw_bg_expense_with_parent c ON a.bg_expense_id = c.bg_expense_lv4_id
					{$bg_expense_join_cond}
				LEFT JOIN " . DB_CENTER . "dc_expense_budget_type d ON a.dc_expense_budget_type_id= d.dc_expense_budget_type_id
				LEFT JOIN " . DB_CENTER . "dc_cost e ON a.dc_cost_id= e.dc_cost_id
				LEFT JOIN (
				SELECT 
					sp.pr_tor_id
					,sp.i_sys 
					,sp.pr_c_code
					,sp.pr_d_doc_ref
					,sp.pr_c_name
					,sp.type_bg_name
				FROM " . DB_NMU_ERP . "vw_pr_po_chk_wd sp
				GROUP BY 
					sp.pr_tor_id
					,sp.i_sys
					,sp.pr_c_code
					,sp.pr_d_doc_ref
					,sp.pr_c_name
					,sp.type_bg_name
				) sp_pr ON a.pr_id = sp_pr.pr_tor_id and a.i_sys = sp_pr.i_sys
				LEFT JOIN (
				SELECT 
					sp.pr_tor_id
					,sp.po_sp_tor_contract_id
					,sp.i_sys
					,sp.po_c_code
				FROM " . DB_NMU_ERP . "vw_pr_po_chk_wd sp
				WHERE ISNULL(po_sp_tor_contract_id,0) > 0
				GROUP BY 
					sp.pr_tor_id
					,sp.po_sp_tor_contract_id
					,sp.i_sys
					,sp.po_c_code
				) sp_po ON a.pr_id = sp_po.pr_tor_id AND a.po_id = sp_po.po_sp_tor_contract_id and a.i_sys = sp_po.i_sys
				WHERE a.i_year = ?
					AND a.i_reserve IN(1,2)
					{$dc_cost_acc1}
					{$con} 
					{$budget1} 
					{$i_pr_type}
					" . (@$_REQUEST["view_by_cost"] == 1 ? ($_REQUEST["i_year"] >= 2024 ? $cost1 : "") : "") . "
					";
			break;
		case 2:
			$sqlMain = "
				SET NOCOUNT ON

				CREATE TABLE #temp_bg_reserve_money(
					i_sys bigint
					,i_pr_type tinyint
					,i_year bigint
					,dc_cost_acc_id bigint
					,dc_cost_id bigint
					,pr_id bigint
					,po_id bigint
					,chk_id bigint
					,dc_expense_budget_type_id bigint
					,bg_expense_id bigint
					,d_create datetime
					,i_reserve tinyint
					,i_finish tinyint
					,i_last int
					,f_amt decimal(18, 2)
				)
				INSERT INTO #temp_bg_reserve_money EXEC " . DB_NMU_EIS . "SP_BG_RESERVE_MONEY

				SELECT 
					--a.i_sys
					CASE a.i_sys 
						WHEN 1 THEN 'ระบบจัดซื้อจัดจ้างและบริหารพัสดุ'
						WHEN 2 THEN 'ระบบ ERP'
						WHEN 3 then 'ระบบ EIS_PROCURE'
						ELSE null
					END AS sys_name
					,e.c_name AS dc_cost_name
					--,a.i_pr_type
					,CASE a.i_pr_type 
						WHEN 1 THEN 'งบประมาณตามบัญชีจัดสรร'
						WHEN 2 THEN 'เงินประจำงวด'
						ELSE null
					END AS pr_type_name
					--,a.i_reserve 
					--,a.i_year
					--,a.pr_id
					--,a.po_id
					--,a.chk_id
					--,a.dc_cost_id
					--,a.dc_expense_budget_type_id
					,d.c_name AS dc_expense_budget_type_name
					,(SELECT aa.c_code + ' : ' + aa.c_name FROM " . DB_NMU_EIS . "bg_expense aa WHERE aa.bg_expense_id = a.bg_expense_id) AS bg_expense_name
					--,a.bg_expense_id
					--,a.i_finish
					--,a.i_last
					,sp_chk.pr_c_code
					,sp_chk.pr_d_doc_ref
					,sp_chk.pr_c_name
					,sp_chk.type_bg_name
					,sp_chk.po_c_code
					,sp_chk.chk_c_code
					,sp_chk.chk_c_doc_ref
					,sp_chk.wd_c_code_ref
					,a.f_amt
					,convert (VARCHAR(10),a.d_create,120) AS d_create
				FROM #temp_bg_reserve_money a
				LEFT JOIN " . DB_CENTER . "dc_expense_budget_type d ON a.dc_expense_budget_type_id= d.dc_expense_budget_type_id
				LEFT JOIN " . DB_CENTER . "dc_cost e ON a.dc_cost_id= e.dc_cost_id
				INNER JOIN " . DB_NMU_EIS . "vw_bg_expense_with_parent c ON a.bg_expense_id = c.bg_expense_lv4_id
					{$bg_expense_join_cond}
				LEFT JOIN (
					SELECT 
						sp.pr_tor_id
						,sp.i_sys
						,sp.pr_c_code
						,sp.pr_d_doc_ref
						,sp.pr_c_name
						,sp.type_bg_name

						,sp.po_sp_tor_contract_id
						,sp.po_c_code

						,sp.chk_id
						,sp.chk_c_code
						,sp.chk_c_doc_ref
						,sp.wd_c_code_ref
					FROM " . DB_NMU_ERP . "vw_pr_po_chk_wd sp
					WHERE ISNULL(sp.chk_id,0) > 0
					GROUP BY 
						sp.pr_tor_id
						,sp.i_sys
						,sp.pr_c_code
						,sp.pr_d_doc_ref
						,sp.pr_c_name
						,sp.type_bg_name

						,sp.po_sp_tor_contract_id
						,sp.po_c_code

						,sp.chk_id
						,sp.chk_c_code
						,sp.chk_c_doc_ref
						,sp.wd_c_code_ref
					) sp_chk ON a.pr_id = sp_chk.pr_tor_id AND a.po_id = sp_chk.po_sp_tor_contract_id AND sp_chk.chk_id = a.chk_id and a.i_sys = sp_chk.i_sys 
				WHERE a.i_reserve = 3
					AND ISNULL(a.i_finish,0) = 0
					AND a.i_year = ?
					AND a.d_create BETWEEN '{$d_date_start}' AND '{$d_date_end}'
					{$dc_cost_acc1}
					{$con} 
					{$budget1} 
					{$i_pr_type}
					{$cost1}
					";
			break;
		case 3:
			$sqlMain = "
				SET NOCOUNT ON

				CREATE TABLE #temp_bg_reserve_money(
					i_sys bigint
					,i_pr_type tinyint
					,i_year bigint
					,dc_cost_acc_id bigint
					,dc_cost_id bigint
					,pr_id bigint
					,po_id bigint
					,chk_id bigint
					,dc_expense_budget_type_id bigint
					,bg_expense_id bigint
					,d_create datetime
					,i_reserve tinyint
					,i_finish tinyint
					,i_last int
					,f_amt decimal(18, 2)
				)
				INSERT INTO #temp_bg_reserve_money EXEC " . DB_NMU_EIS . "SP_BG_RESERVE_MONEY

				SELECT 
					--a.i_sys
					CASE a.i_sys 
						WHEN 1 THEN 'ระบบจัดซื้อจัดจ้างและบริหารพัสดุ'
						WHEN 2 THEN 'ระบบ ERP'
						WHEN 3 THEN 'ระบบ EIS_PROCURE'
						ELSE null
					END AS sys_name
					,e.c_name AS dc_cost_name
					--,a.i_pr_type
					,CASE a.i_pr_type 
						WHEN 1 THEN 'งบประมาณตามบัญชีจัดสรร'
						WHEN 2 THEN 'เงินประจำงวด'
						ELSE null
					END AS pr_type_name
					--,a.i_reserve 
					--,a.i_year
					--,a.pr_id
					--,a.po_id
					--,a.chk_id
					--,a.dc_cost_id
					--,a.dc_expense_budget_type_id
					,d.c_name AS dc_expense_budget_type_name
					,(SELECT aa.c_code + ' : ' + aa.c_name FROM " . DB_NMU_EIS . "bg_expense aa WHERE aa.bg_expense_id = a.bg_expense_id) AS bg_expense_name
					--,a.bg_expense_id
					--,a.i_finish
					--,a.i_last
					,sp_chk.pr_c_code
					,sp_chk.pr_d_doc_ref
					,sp_chk.pr_c_name
					,sp_chk.type_bg_name
					,sp_chk.po_c_code
					,sp_chk.chk_c_code
					,sp_chk.chk_c_doc_ref
					,CASE a.i_sys
						WHEN 1 THEN sp_chk.wd_c_code_ref
						WHEN 2 THEN (select top 1 c_code_ref from " . DB_NMU_EIS . "po_erp_chk aa where aa.chk_id = a.chk_id) 
						ELSE null
					END as wd_c_code_ref
					,a.f_amt
					,convert (VARCHAR(10),a.d_create,120) AS d_create
				FROM #temp_bg_reserve_money a
				LEFT JOIN " . DB_CENTER . "dc_expense_budget_type d ON a.dc_expense_budget_type_id= d.dc_expense_budget_type_id
				LEFT JOIN " . DB_CENTER . "dc_cost e ON a.dc_cost_id= e.dc_cost_id
				INNER JOIN " . DB_NMU_EIS . "vw_bg_expense_with_parent c ON a.bg_expense_id = c.bg_expense_lv4_id
					{$bg_expense_join_cond}
				LEFT JOIN (
					SELECT 
						sp.pr_tor_id
						,sp.i_sys
						,sp.pr_c_code
						,sp.pr_d_doc_ref
						,sp.pr_c_name
						,sp.type_bg_name

						,sp.po_sp_tor_contract_id
						,sp.po_c_code

						,sp.chk_id
						,sp.chk_c_code
						,sp.chk_c_doc_ref

						,sp.wd_c_code_ref
					FROM " . DB_NMU_ERP . "vw_pr_po_chk_wd sp
					WHERE ISNULL(sp.chk_id,0) > 0
					GROUP BY 
						sp.pr_tor_id
						,sp.i_sys
						,sp.pr_c_code
						,sp.pr_d_doc_ref
						,sp.pr_c_name
						,sp.type_bg_name

						,sp.po_sp_tor_contract_id
						,sp.po_c_code

						,sp.chk_id
						,sp.chk_c_code
						,sp.chk_c_doc_ref

						,sp.wd_c_code_ref
					) sp_chk ON a.pr_id = sp_chk.pr_tor_id AND a.po_id = sp_chk.po_sp_tor_contract_id AND sp_chk.chk_id = a.chk_id AND a.i_sys = sp_chk.i_sys
				WHERE a.i_reserve = 3
					AND ISNULL(a.i_finish,0) = 1
					AND a.d_create BETWEEN '{$d_date_start}' AND '{$d_date_end}'
					AND a.i_year = ?
					{$dc_cost_acc1}
					{$con} 
					{$budget1} 
					{$i_pr_type}
					{$cost1}
				ORDER BY sp_chk.wd_c_code_ref";
			break;
	}
	if (($_REQUEST["type"] ?? "") == 'show_sql') {
		/******echo sql******/
		$sql = $sqlMain;
		$arr = array($i_year);

		$sql = str_replace('?', '#-#', $sql);
		foreach ($arr as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
		/********************/
	}
	$stmt = $db->QueryParam($sqlMain, array($i_year));

	if ($stmt) {
		$no = 0;
		$f_total = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"                            =>	1,
				"no"                                =>	++$no,
				"sys_name"                          =>	$row["sys_name"],
				"dc_cost_name"                      =>	$row["dc_cost_name"],
				"pr_type_name"                      =>	$row["pr_type_name"],
				"dc_expense_budget_type_name"       =>	$row["dc_expense_budget_type_name"],
				"bg_expense_name"       			=>	$row["bg_expense_name"],
				"pr_c_code"                         =>	$row["pr_c_code"],
				"pr_d_doc_ref"                      =>	$row["pr_d_doc_ref"],
				"pr_c_name"                         =>	$row["pr_c_name"],
				"type_bg_name"                      =>	$row["type_bg_name"],
				"po_c_code"                         =>	$row["po_c_code"] == '' ? '-' : $row["po_c_code"],
				"f_amt"                             =>	$row["f_amt"],
				"d_create"                          =>	$row["d_create"],
			);
			if ($_REQUEST["i_reserve"] == 2) {
				$temp += array("chk_c_code" => $row["chk_c_code"] == '' ? '-' : $row["chk_c_code"]);
				$temp += array("chk_c_doc_ref" => $row["chk_c_doc_ref"] == '' ? '-' : $row["chk_c_doc_ref"]);
				$temp += array("wd_c_code_ref" => $row["wd_c_code_ref"] == '' ? '-' : $row["wd_c_code_ref"]);
			} else if ($_REQUEST["i_reserve"] == 3) {
				$temp += array("chk_c_code" => $row["chk_c_code"] == '' ? '-' : $row["chk_c_code"]);
				$temp += array("chk_c_doc_ref" => $row["chk_c_doc_ref"] == '' ? '-' : $row["chk_c_doc_ref"]);
				$temp += array("wd_c_code_ref" => $row["wd_c_code_ref"] == '' ? '-' : $row["wd_c_code_ref"]);
			}
			${$root}[]	= $temp;
			$f_total += $row["f_amt"];
		}
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 4,
			"f_amt"							=> $f_total
		);
		${$root}[]	= $temp;
	}



	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}