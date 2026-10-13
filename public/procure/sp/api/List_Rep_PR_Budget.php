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

	$i_year = $_REQUEST["i_year"];
	$budget1 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND  a.dc_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";
	$dc_cost1 = ($_REQUEST["dc_cost_id"] > 0) ? " AND b.dc_cost_id = {$_REQUEST["dc_cost_id"]}" : "";

		$con .=  " AND a.bg_expense_id IN ({$_REQUEST["bg_expense_id"]})";
		$sqlMain = "
				SET NOCOUNT ON
				DECLARE @i_year AS numeric = ?;
                select 
                a.pr_id 
                , isnull(sum(a.f_amt),0) as f_amt 
                INTO   #sum_withdraw
                from   NMU.dbo.bg_reserve_money a 
				WHERE  a.i_reserve = 3
				and a.i_year = @i_year
                and a.i_enable = 1 
                and a.i_finish = 1 
				{$con}
                GROUP BY a.pr_id

				SELECT
				b.c_code pr_code
				, c.c_code po_code
				, b.tor_id as sp_tor_id
				, c.sp_tor_contract_id as sp_tor_contract_id
				, case when isnull(b.i_type_contract,0) = 1 then 'สัญญา' when  isnull(b.i_type_contract,0) = 2  then 'ใบสั่ง'   when  isnull(b.i_type_contract,0) = 3 then 'จะซื้อจะขาย'   else  'ยังไม้ได้ระบุ' end as i_type_contract
				, b.c_name 
				, (SELECT c_name FROM NMU_ERP.DBO.sp_emp WHERE b.sp_emp_id = sp_emp_id  ) as emp_name
				, a.i_year
				, (SELECT c_name FROM NMU_ERP.DBO.dc_expense_budget_type WHERE a.dc_budget_type_id = dc_expense_budget_type_id  ) as dc_expense_budget_type
				, (SELECT c_name FROM NMU.DBO.bg_expense WHERE a.bg_expense_id = bg_expense_id  ) as bg_expense
				, a.f_amt
				,(SELECT c_name from NMU_ERP.dbo.sp_status_hdr where sp_status_hdr_id =  b.tor_status_id ) as sp_status_hdr
				, isnull(d.f_amt,0) as f_sum 
				, isnull(c.f_total_amt,0) as f_total_contract
				FROM NMU.dbo.bg_reserve_money a 
				LEFT JOIN sp_tor b on b.tor_id = a.pr_id 
				LEFT JOIN sp_tor_contract c on c.sp_tor_id = b. tor_id 
				left join #sum_withdraw  d on d.pr_id = a.pr_id
				WHERE a.po_id is  null and a.chk_id is  null 
				and a.i_year = @i_year and a.i_enable = 1 and b.i_enabled = 1  and c.i_enabled = 1
				--AND a.bg_expense_id = {$_REQUEST["bg_expense_id"]}
				{$con} {$budget1}
        	ORDER BY a.bg_expense_id ;";

	$stmt = $db->QueryParam($sqlMain, array($i_year));
	if ($stmt) {
		$no = 0;
		$f_total = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"							=> 1,
				"no"								=> ++$no,
				"pr_code"							=> $row["pr_code"],
				"po_code"							=> $row["po_code"],
				"sp_tor_id"							=> $row["sp_tor_id"],
				"sp_tor_contract_id"				=> $row["sp_tor_contract_id"],
				"i_type_contract"					=> $row["i_type_contract"],
				"f_sum"								=> $row["f_sum"],
				"f_total_contract"					=> $row["f_total_contract"],
				"c_name"							=> $row["c_name"],
				"emp_name"							=> $row["emp_name"],
				"i_year"							=> $row["i_year"],
				"f_total"							=> $row["f_amt"],
				"dc_expense_budget_type"			=> $row["dc_expense_budget_type"],
				"bg_expense"						=> $row["bg_expense"],
				"sp_status_hdr"						=> $row["sp_status_hdr"],
				// "c_name_lv4"					=> $row["c_code_lv4"] . " : " . $row["c_name_lv4"],
			);
			${$root}[]	= $temp;
			$f_total += $row["f_amt"];
		}
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 4,
			"f_total"						=> $f_total
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
