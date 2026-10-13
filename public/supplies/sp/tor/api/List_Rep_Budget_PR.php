<?php

use function PHPSTORM_META\expectedArguments;

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
	$i_year = $_REQUEST["i_year"];
	if($_REQUEST['i_type_bg'] == 1 ){
	$budget1 = ($_REQUEST["dc_expense_budget_type"] > 0) ? " AND  a.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type"]}" : "";
	$bg_expense_id = ($_REQUEST["bg_expense_id"] > 0) ? " AND  a.bg_expense_id = {$_REQUEST["bg_expense_id"]}" : "";
	$i_reserve = ($_REQUEST["i_type_bg"] > 0) ? " AND  a.i_reserve = {$_REQUEST["i_type_bg"]}" : "";
	// $dc_cost1 = ($_REQUEST["dc_cost_id"] > 0) ? " AND b.dc_cost_id = {$_REQUEST["dc_cost_id"]}" : "";
		$con .=  " AND a.bg_expense_id IN ({$_REQUEST["bg_expense_id"]})";
		$sqlMain = "SET NOCOUNT ON
				DECLARE @i_year AS numeric = {$i_year}; 
				SELECT 
					b.c_code as pr_code 
					,(select c_name from NMU_ERP.dbo.sp_status_hdr where sp_status_hdr_id = b.tor_status_id ) as sp_status_hdr
					,c.c_code  as po_code 
					,isnull(b.c_name,c.c_name) as c_name
					,a.f_amt  
					,b.f_total_amt as f_total_pr
					,c.f_total_amt as f_total_contract
					,(select c_name from nmu.dbo.bg_expense where bg_expense_id = b.po_expense_id ) as bg_expense_id
					,(select c_name from NMU_ERP.dbo.dc_expense_budget_type  where dc_expense_budget_type_id = b.dc_expense_budget_type_id ) as dc_expense_budget_type
					,case when isnull(a.bg_expense_id,0) !=  isnull(b.po_expense_id,0) then 'ข้อมูลหมวดค่าใช้จ่ายไม่ตรง'
					when isnull(a.dc_expense_budget_type_id,0) != isnull(b.dc_expense_budget_type_id,0)  then 'ข้อมูลแหลงเงินไม่ตรง'
					else 'ปกติ' end as i_type_check
					, (select c_name from sp_emp where sp_emp_id = b.sp_emp_id) as emp_name
					, b.i_yyyy as i_year
					FROM NMU..vw_bg_reserve_money a
					INNER JOIN NMU_ERP.dbo.sp_tor b on b.tor_id = a.pr_id 
					LEFT JOIN NMU_ERP.dbo.sp_tor_contract c on a.pr_id = c.sp_tor_id  
					WHERE a.i_year = 2024
					AND a.f_amt > 0 
					AND a.i_pr_type = 1 
					AND a.i_sys = 1
					AND a.dc_cost_id = 38 
					{$i_reserve}
					{$budget1}
					{$bg_expense_id} ;";
	$stmt = $db->QueryParam($sqlMain, array($i_year));
	if ($stmt) {
		$no = 0;
		$f_total = 0;
		$f_total_pr = 0;
		$f_total_contract = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"							=> 1,
				"no"								=> ++$no,
				"pr_code"							=> $row["pr_code"],
				"po_code"							=> $row["po_code"],
				// "i_type_contract"					=> $row["i_type_contract"],
				"f_total_pr"						=> $row["f_total_pr"],
				"f_total_contract"					=> $row["f_total_contract"],
				"c_name"							=> $row["c_name"],
				"emp_name"							=> $row["emp_name"],
				"i_year"							=> $row["i_year"],
				"f_total"							=> $row["f_amt"],
				"dc_expense_budget_type"			=> $row["dc_expense_budget_type"],
				"bg_expense"						=> $row["bg_expense_id"],
				"sp_status_hdr"						=> $row["sp_status_hdr"],
				"i_type_check"						=> $row["i_type_check"],
				// "c_name_lv4"					=> $row["c_code_lv4"] . " : " . $row["c_name_lv4"],
			);
			${$root}[]	= $temp;
			$f_total += $row["f_amt"];
			$f_total_pr += $row["f_total_pr"];
			$f_total_contract += $row["f_total_contract"];
		}
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 4,
			"f_total"						=> $f_total,
			"f_total_pr"					=> $f_total_pr,
			"f_total_contract"				=> $f_total_contract
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST['i_type_bg'] == 2) {
	$budget1 = ($_REQUEST["dc_expense_budget_type"] > 0) ? " AND  a.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type"]}" : "";
	$bg_expense_id = ($_REQUEST["bg_expense_id"] > 0) ? " AND  a.bg_expense_id = {$_REQUEST["bg_expense_id"]}" : "";
	$i_reserve = ($_REQUEST["i_type_bg"] > 0) ? " AND  a.i_reserve = {$_REQUEST["i_type_bg"]}" : "";
	// $dc_cost1 = ($_REQUEST["dc_cost_id"] > 0) ? " AND b.dc_cost_id = {$_REQUEST["dc_cost_id"]}" : "";
		$con .=  " AND a.bg_expense_id IN ({$_REQUEST["bg_expense_id"]})";
		$sqlMain = "SET NOCOUNT ON
				DECLARE @i_year AS numeric = {$i_year}; 
				SELECT 
					b.c_code as pr_code 
					,(select c_name from NMU_ERP.dbo.sp_status_hdr where sp_status_hdr_id = b.tor_status_id ) as sp_status_hdr
					,c.c_code  as po_code 
					,isnull(b.c_name,c.c_name) as c_name
					,a.f_amt  
					,b.f_total_amt as f_total_pr
					,c.f_total_amt as f_total_contract
					,(select c_name from nmu.dbo.bg_expense where bg_expense_id = b.po_expense_id ) as bg_expense_id
					,(select c_name from NMU_ERP.dbo.dc_expense_budget_type  where dc_expense_budget_type_id = b.dc_expense_budget_type_id ) as dc_expense_budget_type
					,case when isnull(a.bg_expense_id,0) !=  isnull(b.po_expense_id,0) then 'ข้อมูลหมวดค่าใช้จ่ายไม่ตรง'
					when isnull(a.dc_expense_budget_type_id,0) != isnull(b.dc_expense_budget_type_id,0)  then 'ข้อมูลแหลงเงินไม่ตรง'
					else 'ปกติ' end as i_type_check
					, (select c_name from sp_emp where sp_emp_id = b.sp_emp_id) as emp_name
					, b.i_yyyy as i_year
					FROM NMU..vw_bg_reserve_money a
					INNER JOIN NMU_ERP.dbo.sp_tor b on b.tor_id = a.pr_id 
					LEFT JOIN NMU_ERP.dbo.sp_tor_contract c on a.pr_id = c.sp_tor_id  
					WHERE a.i_year = 2024
					AND a.f_amt > 0 
					AND a.i_pr_type = 1 
					AND a.dc_cost_id = 38 
					AND a.i_sys = 1
					
					{$i_reserve}
					{$budget1}
					{$bg_expense_id} ;";
	$stmt = $db->QueryParam($sqlMain, array($i_year));
	if ($stmt) {
		$no = 0;
		$f_total = 0;
		$f_total_pr = 0;
		$f_total_contract = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"							=> 1,
				"no"								=> ++$no,
				"pr_code"							=> $row["pr_code"],
				"po_code"							=> $row["po_code"],
				// "i_type_contract"					=> $row["i_type_contract"],
				"f_total_pr"						=> $row["f_total_pr"],
				"f_total_contract"					=> $row["f_total_contract"],
				"c_name"							=> $row["c_name"],
				"emp_name"							=> $row["emp_name"],
				"i_year"							=> $row["i_year"],
				"f_total"							=> $row["f_amt"],
				"dc_expense_budget_type"			=> $row["dc_expense_budget_type"],
				"bg_expense"						=> $row["bg_expense_id"],
				"sp_status_hdr"						=> $row["sp_status_hdr"],
				"i_type_check"						=> $row["i_type_check"],
				// "c_name_lv4"					=> $row["c_code_lv4"] . " : " . $row["c_name_lv4"],
			);
			${$root}[]	= $temp;
			$f_total += $row["f_amt"];
			$f_total_pr += $row["f_total_pr"];
			$f_total_contract += $row["f_total_contract"];
		}
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 4,
			"f_total"						=> $f_total,
			"f_total_pr"					=> $f_total_pr,
			"f_total_contract"				=> $f_total_contract
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST['i_type_bg'] == 3) {
	$budget1 = ($_REQUEST["dc_expense_budget_type"] > 0) ? " AND  a.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type"]}" : "";
	$bg_expense_id = ($_REQUEST["bg_expense_id"] > 0) ? " AND  a.bg_expense_id = {$_REQUEST["bg_expense_id"]}" : "";
	// $i_reserve = ($_REQUEST["i_type_bg"] > 0) ? " AND  a.i_reserve = {$_REQUEST["i_type_bg"]}" : "";
	// $dc_cost1 = ($_REQUEST["dc_cost_id"] > 0) ? " AND b.dc_cost_id = {$_REQUEST["dc_cost_id"]}" : "";
		$con .=  " AND a.bg_expense_id IN ({$_REQUEST["bg_expense_id"]})";
		$sqlMain = "SET NOCOUNT ON
		DECLARE @i_year AS numeric = {$i_year}; 
		SELECT 
			(select c_code   from sp_tor where tor_id = a.pr_id ) as  pr_code 
			,(select c_code   from sp_tor_contract where sp_tor_contract_id = a.po_id ) as  po_code 
			,(select c_name  from sp_Tor where tor_id  = a.pr_id ) as c_name 
			,b.c_arrive_code
			,b.c_code  as c_code_check
			,c.c_code_ref
			,(select f_total_amt  from sp_tor_contract where sp_tor_contract_id = a.po_id ) as f_total_contract
			,(select c_name from sp_emp where sp_emp_id = (select sp_emp_id from sp_tor where tor_id = a.pr_id ) ) as emp_name
			,a.f_amt
			,c.f_total as f_total_witdraw 
			,(select c_name from nmu..bg_expense where bg_expense_id = a.bg_expense_id ) as bg_expense
			,(select c_name from dc_expense_budget_type where dc_expense_budget_type_id = a.dc_expense_budget_type_id ) as dc_expense_budget_type
			,case when isnull(a.dc_expense_budget_type_id,0) != isnull(c.dc_expense_budget_type_id,0)  then 'แหล่งเงินตอนเบิกกับที่จองไม่ตรงกัน'
			when isnull(a.bg_expense_id,0) != isnull(c.bg_expense_id,0)  then 'หมวดค่าใช้จ่ายยตอนเบิกกับที่จองไม่ตรงกัน'
			else 'ปกติ' end as i_type_check
			,case when isnull(a.dc_expense_budget_type_id,0) != isnull(c.dc_expense_budget_type_id,0)  then 1
			when isnull(a.bg_expense_id,0) != isnull(c.bg_expense_id,0)  then 2
			else 0 end as i_type_rep
			,case when (select  isnull(i_type_bg,0) from  sp_tor where  tor_id = a.pr_id  ) = 5 then 'PR จองเงินแล้วข้ามไปเบิก' 
			when  (select  isnull(i_type_bg,0) from  sp_tor where  tor_id = a.pr_id  ) = 2 then 'โครงการต่อเนื่อง' 
			when  (select  isnull(i_type_bg,0) from  sp_tor where  tor_id = a.pr_id  ) = 3 then 'โครงการต่อเนื่อง/ย่อย' 
			when  (select  isnull(i_type_bg,0) from  sp_tor where  tor_id = a.pr_id  ) = 1 then 'PR ปกติ' 
			else 'อื่น ๆ' end as i_type_pr			
			,a.i_year	
			FROM NMU..vw_bg_reserve_money a
			INNER JOIN NMU_ERP.dbo.sp_check_period_hdr b on a.chk_id = b.sp_check_period_hdr_id 
			INNER JOIN NMU_ERP.dbo.sp_withdraw c on a.chk_id = c.sp_check_period_hdr_id
			WHERE a.i_year = @i_year 
			AND a.f_amt > 0
			--and a.i_finish = 1
			AND a.i_sys = 1
			AND  a.i_reserve = 3
					{$budget1}
					{$bg_expense_id} ;";
	$stmt = $db->QueryParam($sqlMain, array($i_year));
	if ($stmt) {
		$no = 0;
		$f_total = 0;
		$f_total_witdraw = 0;
		$f_total_contract = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"							=> 1,
				"no"								=> ++$no,
				"pr_code"							=> $row["pr_code"],
				"po_code"							=> $row["po_code"],
				"c_arrive_code"						=> $row["c_arrive_code"],
				"c_code_check"						=> $row["c_code_check"],
				"c_code_ref"						=> $row["c_code_ref"],
				"c_name"							=> $row["c_name"],
				"emp_name"							=> $row["emp_name"],
				"i_year"							=> $row["i_year"],
				"i_type_pr"							=> $row["i_type_pr"],
				"i_type_rep"						=> $row["i_type_rep"],
				"dc_expense_budget_type"			=> $row["dc_expense_budget_type"],
				"bg_expense"						=> $row["bg_expense"],
				"i_type_check"						=> $row["i_type_check"],
				"f_total"							=> $row["f_amt"],
				"f_total_witdraw"					=> $row["f_total_witdraw"],
				"f_total_contract"					=> $row["f_total_contract"],
			);
			${$root}[]	= $temp;
			$f_total += $row["f_amt"];
			$f_total_witdraw += $row["f_total_witdraw"];
			$f_total_contract += $row["f_total_contract"];
		}
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 4,
			"f_total"						=> $f_total,
			"f_total_witdraw"				=> $f_total_witdraw,
			"f_total_contract"				=> $f_total_contract
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST['i_type_bg'] == 4) {
	$budget1 = ($_REQUEST["dc_expense_budget_type"] > 0) ? " AND  a.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type"]}" : "";
	$budget2 = ($_REQUEST["dc_expense_budget_type"] > 0) ? " AND  a.dc_budget_type_id = {$_REQUEST["dc_expense_budget_type"]}" : "";
	$bg_expense_id = ($_REQUEST["bg_expense_id"] > 0) ? " AND  a.bg_expense_id = {$_REQUEST["bg_expense_id"]}" : "";
	$i_reserve = ($_REQUEST["i_type_bg"] > 0) ? " AND  a.i_reserve = {$_REQUEST["i_type_bg"]}" : "";
	// $dc_cost1 = ($_REQUEST["dc_cost_id"] > 0) ? " AND b.dc_cost_id = {$_REQUEST["dc_cost_id"]}" : "";
		$con .=  " AND a.bg_expense_id IN ({$_REQUEST["bg_expense_id"]})";
		$sqlMain = "SET NOCOUNT ON
		DECLARE @i_year AS numeric = {$i_year}; 
		SELECT 	
		a.po_id,a.dc_expense_budget_type_id
		,a.bg_expense_id
		,sum(c.f_total) as f_total_witdraw
		into #bg_reserve_winthdraw
		FROM NMU..vw_bg_reserve_money a
		INNER JOIN NMU_ERP.dbo.sp_check_period_hdr b on a.chk_id = b.sp_check_period_hdr_id 
		INNER JOIN NMU_ERP.dbo.sp_withdraw c on a.chk_id = c.sp_check_period_hdr_id
		WHERE a.i_year = 2024 
		AND a.f_amt > 0
		--and a.i_finish = 1
		AND a.i_sys = 1
		AND  a.i_reserve = 3
		GROUP BY a.po_id ,a.dc_expense_budget_type_id
		,a.bg_expense_id 
		SELECT
				b.c_code as pr_code 
				,(select c_name from NMU_ERP.dbo.sp_status_hdr where sp_status_hdr_id = b.tor_status_id ) as sp_status_hdr
				,c.c_code  as po_code 
				,isnull(b.c_name,c.c_name) as c_name
				,a.f_amt  
				,b.f_total_amt as f_total_pr
				,c.f_total_amt as f_total_contract
				,isnull(cc.f_total_witdraw,0) as f_winthdraw
				,(isnull(a.f_amt,0) - isnull(cc.f_total_witdraw,0) ) as f_remaining
				,(select c_name from nmu.dbo.bg_expense where bg_expense_id = b.po_expense_id ) as bg_expense_id
				,(select c_name from NMU_ERP.dbo.dc_expense_budget_type  where dc_expense_budget_type_id = b.dc_expense_budget_type_id ) as dc_expense_budget_type
				,case when isnull(a.bg_expense_id,0) !=  isnull(b.po_expense_id,0) then 'ข้อมูลหมวดค่าใช้จ่ายไม่ตรง'
				when isnull(a.dc_expense_budget_type_id,0) != isnull(b.dc_expense_budget_type_id,0)  then 'ข้อมูลแหลงเงินไม่ตรง'
				else 'ปกติ' end as i_type_check
				, (select c_name from sp_emp where sp_emp_id = b.sp_emp_id) as emp_name
				, b.i_yyyy as i_year
				,case when (select  isnull(i_type_bg,0) from  sp_tor where  tor_id = a.pr_id  ) = 5 then 'PR จองเงินแล้วข้ามไปเบิก' 
					when  (select  isnull(i_type_bg,0) from  sp_tor where  tor_id = a.pr_id  ) = 2 then 'โครงการต่อเนื่อง' 
					when  (select  isnull(i_type_bg,0) from  sp_tor where  tor_id = a.pr_id  ) = 3 then 'โครงการต่อเนื่อง/ย่อย' 
					when  (select  isnull(i_type_bg,0) from  sp_tor where  tor_id = a.pr_id  ) = 4 then 'กันเหลื่อม' 
					when  (select  isnull(i_type_bg,0) from  sp_tor where  tor_id = a.pr_id  ) = 1 then 'PR ปกติ' 
					else 'อื่น ๆ' end as i_type_pr	
				FROM NMU..vw_bg_reserve_money a
				LEFT JOIN NMU_ERP.dbo.sp_tor b on b.tor_id = a.pr_id 
				LEFT JOIN NMU_ERP.dbo.sp_tor_contract c on a.pr_id = c.sp_tor_id  
				LEFT JOIN #bg_reserve_winthdraw cc on  cc.po_id  =  a.po_id 
				WHERE a.i_year = @i_year
				AND a.i_pr_type = 1 
				AND a.dc_cost_id = 38 
				AND a.i_reserve =2 
				--AND (isnull(a.f_amt,0) - isnull(cc.f_total_witdraw,0) ) > 0
					{$budget1}
					{$bg_expense_id} 
					;";
	$stmt = $db->QueryParam($sqlMain, array($i_year));
	if ($stmt) {
		$no = 0;
		$f_total = 0;
		$f_total_pr = 0;
		$f_total_witdraw = 0;
		$f_total_contract = 0;
		$f_winthdraw = 0;
		$f_remaining = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"							=> 1,
				"no"								=> ++$no,
				"pr_code"							=> $row["pr_code"],
				"po_code"							=> $row["po_code"],
				"i_type_pr"							=> $row["i_type_pr"],
				"f_total_pr"						=> $row["f_total_pr"],
				"f_total_contract"					=> $row["f_total_contract"],
				"c_name"							=> $row["c_name"],
				"emp_name"							=> $row["emp_name"],
				"i_year"							=> $row["i_year"],
				"f_total"							=> $row["f_amt"],
				"dc_expense_budget_type"			=> $row["dc_expense_budget_type"],
				"bg_expense"						=> $row["bg_expense_id"],
				"sp_status_hdr"						=> $row["sp_status_hdr"],
				"i_type_check"						=> $row["i_type_check"],
				"f_remaining"						=> $row["f_remaining"],
				"f_winthdraw"						=> $row["f_winthdraw"],
			);
			${$root}[]	= $temp;
			$f_total += $row["f_amt"];
			$f_total_pr += $row["f_total_pr"];
			$f_total_contract += $row["f_total_contract"];
			$f_winthdraw += $row["f_winthdraw"];
			$f_remaining += $row["f_remaining"];
		}
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 4,
			"f_total"						=> $f_total,
			"f_total_pr"					=> $f_total_pr,
			"f_total_witdraw"				=> $f_total_witdraw,
			"f_total_contract"				=> $f_total_contract,
			"f_winthdraw"					=> $f_winthdraw,
			"f_remaining"					=> $f_remaining
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
}
