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

	// $budget1 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND  a.dc_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";
	// $dc_cost1 = ($_REQUEST["dc_cost_id"] > 0) ? " AND b.dc_cost_id = {$_REQUEST["dc_cost_id"]}" : "";

	$type = $_REQUEST["type"] ?? 0;
	$start = $_REQUEST["start"] ?? 0;
	$i_enabled =  ($_REQUEST["i_enabled"] == 1) ? ' AND a.i_enabled = 1' :' ';

	$i_tor_type = $_REQUEST["chart"] ?? 0;
	$year_en = ($_REQUEST["year_en"] > 0) ?   " AND  a.i_pr_year =  {$_REQUEST["year_en"]}" : '';
	$sp_emp_id = ($_REQUEST["sp_emp_id"] == 9999999) ?  ''  : " AND isnull(a.sp_emp_id,0) =  {$_REQUEST["sp_emp_id"]}";
	switch ($type) {
		case "i_product_type":
			$where = '';
			break;
		case 'i_product_type1': // ครุภัณฑ์ 
			$where = ' AND  isnull(a.i_product_type,0) = 2   ';
			break;
		case 'i_product_type2': // วัสดุ
			$where = ' AND  isnull(a.i_product_type,0) = 1 ';
			break;
		case 'i_product_type3': // จ้าง ไม่ได้ของ
			$where = ' AND isnull(a.i_type_bg,0) <> 2 AND  isnull(a.i_product_type,0) = 0 AND isnull(a.i_purchase,0) = 2  ';
			break;
		case 'i_product_type4': // เช่า ไม่ได้ของ
			$where = ' AND  isnull(a.i_product_type,0) = 0 AND isnull(a.i_purchase,0) = 3 ';
			break;
		case 'i_product_type5': // โครงการต่อเนื่อง
			$where = ' AND isnull(a.i_type_bg,0) = 2   ';
			break;
		case 'i_product_type6': // จะซื้อจะขาย
			$where = ' AND isnull(a.i_type_contract,0) = 3   ';
			break;
		case 'i_product_type7': // โครงการก่อสร้าง
			$where = ' AND  isnull(a.i_product_type,0) = 0  ';
			break;
		case 'i_product_type8': // รวม
			$where = ' AND a.c_code is not null ';
			break;
	}
	switch ($start) {
		case '0':
			$start = '';
			$i_enabled =' ';
			break;
		case '8':
			$start = ' AND a.tor_status_id in(24,25,26,13)';
			break;
		case '9':
			$start = ' AND a.tor_status_id in(1,11,12,14,15,16,17,18,19,20,22,23,28,29,30,31) AND b.c_code is null ';
			break;
		case '10':
			$start = ' AND a.tor_status_id  in(20,21,10034) AND  d.c_code IS  NULL  AND b.c_code is not null';
			break;
		case '11':
			$start = ' AND b.c_code is not null AND a.tor_status_id  in(20,21,10034) AND d.c_code is not null AND isnull(d.po_working_hdr_id,0) = 0 ';
			break;
		case '12':
			$start = ' AND b.c_code is not null AND a.tor_status_id   in(20,21,10034) AND isnull(d.po_working_hdr_id,0) > 0 AND d.c_code is not null and isnull(f.i_status_last,0) < 11   ';
			break;
		case '13':
			$start = ' AND b.c_code is not null AND a.tor_status_id  in(20,21,10034) AND isnull(d.po_working_hdr_id,0) > 0 AND d.c_code is not null and isnull(f.i_status_last,0) >= 11     ';
			break;
		case '15':
			$start = '  ';
			$i_enabled = ' AND a.i_enabled = 2 and a.c_code is not null';
			break;
	}
	switch ($i_tor_type) {
		case '0':
			$i_tor_type = '';
			break;
		case 'i_tor_type1':
			$i_tor_type = ' AND ISNULL(a.tor_type_id,0) in(4)';
			break;
		case 'i_tor_type2':
			$i_tor_type = ' AND ISNULL(a.tor_type_id,0) in(3)';
			break;
		case 'i_tor_type3':
			$i_tor_type = ' AND ISNULL(a.tor_type_id,0) in(1) AND a.f_total_amt < 500000  ';
			break;
		case 'i_tor_type4':
			$i_tor_type = ' AND ISNULL(a.tor_type_id,0) in(1) AND a.f_total_amt > = 500000 ';
			break;
		case 'i_tor_type5':
			$i_tor_type = ' AND ISNULL(a.tor_type_id,0) in(2)';
			break;
		case 'i_tor_type6':
			$i_tor_type = ' ';
			break;
	}
	// echo ($where);
	// exit;
	$sqlMain = "SELECT 
					a.sp_emp_id
					,a.tor_id as sp_tor_id
                    ,isnull((select c_name from sp_department where bb.dc_department_id = dc_department_id ),'ยังไม่ได้ระบุ')as dc_department
					,isnull((select c_name from sp_emp where a.sp_emp_id = sp_emp_id ),'ยังไม่ได้ระบุ') as  sp_emp
					,(select c_name from sp_status_hdr where a.tor_status_id = sp_status_hdr_id ) as sp_status_hdr
					,a.c_name 
					,(select c_name from sp_type_status where sp_type_status_id = a.tor_type_id ) as tor_type
					,a.c_code 
                    ,isnull(a.i_product_type,0) as i_product_type 
					,(select c_name from " . DB_NMU_EIS . "bg_expense  where bg_expense_id = a.po_expense_id ) po_expense 
					,(select c_name from " . DB_CENTER . "dc_expense_budget_type  where dc_expense_budget_type_id = a.dc_expense_budget_type_id ) dc_expense_budget_type 
					,(select c_name from " . DB_CENTER . "dc_cost  where dc_cost_id = a.dc_cost2_id ) as  dc_cost2_id 
                    ,isnull(a.i_purchase,0) as i_purchase 
                    ,isnull(a.i_type_contract,0) as i_type_contract 
                    ,isnull(b.c_code,'ยังไม่ระบุ') as po_code
                    ,(select c_name from sp_type_bg where a.i_type_bg = sp_type_bg_id ) as i_type_bg
					,a.f_total_amt
					,a.i_yyyy
					,isnull(a.i_pr_year+543,0) as i_pr_year
                    ,a.index_receive
                    ,a.d_doc_ref
					,d.c_code as chk_code
					,isnull(d.po_working_hdr_id,0 ) as po_working_hdr_id
 					,case when a.i_enabled = 1 then 'ใช้งาน' else 'ไม่ใช้งาน' end as  i_enabled
					from sp_tor  a 
					left join  sp_emp bb on a.sp_emp_id = bb.sp_emp_id 
                    /*left join (  SELECT sp_tor_id, MAX(sp_tor_contract_id) AS sp_tor_contract_id
                                    FROM sp_tor_contract
                                    GROUP BY sp_tor_id
                                    )  ss  on ss.sp_tor_id = a.tor_id*/
 					left join  sp_tor_contract b on  a.tor_id = b.sp_tor_id   and b.c_code is not  null  AND b.i_enabled = 1
					left join  sp_tor_hdr_period c on b.sp_tor_contract_id = c.sp_tor_contract_id and c.i_is_last = 1 and c.i_enabled = 1
					left join  sp_check_period_hdr d on c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id 
					left join  sp_check_billing_items e on e.sp_check_period_hdr_id = d.sp_check_period_hdr_id 
					left join  NMU_EIS..po_working_hdr f on d.po_working_hdr_id = f.po_working_hdr_id 
					where 1=1
					{$year_en}
					{$i_enabled}
					{$start}
					{$sp_emp_id}
					{$i_tor_type}
					{$where}  
					order by b.c_code desc ,a.sp_emp_id,a.c_code , a.tor_status_id
					";
	$stmt = $db->QueryParam($sqlMain, array());
	// /******echo sql******/
	// $sql = (@$sqlMain) ? $sqlMain : $sql;
	// $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

	// $sql = str_replace('?', '#-#', $sql);
	// foreach ($arr as $fld => $value) {
	//  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
	// }
	// echo $sql; exit;
	// /********************/

	if ($stmt) {
		$no = 0;
		$f_total_amt = 0;
		$i_product_type = 0;
		$i_purchase = 0;

		while ($row = $db->Fetch($stmt)) {
			switch (intval($row["i_product_type"])) {
				case 0:
					$i_product_type = "<b style='color:#116CEF'>ไม่ได้ของ</b>";
					break;
				case 1:
					$i_product_type = "<b style='color:#116CEF'>วัสดุ</b>";
					break;
				case 2:
					$i_product_type = "<b style='color:#116CEF'>ครุภัณฑ์</b>";
					break;
				case 3:
					$i_product_type = "<b style='color:#116CEF'>วัสดุทางการแพทย์</b>";
					break;
				case 4:
					$i_product_type = "<b style='color:#116CEF'></b>";
					break;
			};
			switch (intval($row["i_purchase"])) {
				case 0:
					$i_purchase = "<b style='color:#116CEF'>ไม่ได้ของ</b>";
					break;
				case 1:
					$i_purchase = "<b style='color:#116CEF'>ซื้อ</b>";
					break;
				case 2:
					$i_purchase = "<b style='color:#116CEF'>จ้าง</b>";
					break;
				case 3:
					$i_purchase = "<b style='color:#116CEF'>เช่า</b>";
					break;
			};
			switch (intval($row["i_type_contract"])) {
				case 0:
					$i_type_contract = "<b style='color:#116CEF'>ยังไม่ได้ระบุ</b>";
					break;
				case 1:
					$i_type_contract = "<b style='color:#116CEF'>สัญญา</b>";
					break;
				case 2:
					$i_type_contract = "<b style='color:#116CEF'>ใบสั่ง</b>";
					break;
				case 3:
					$i_type_contract = "<b style='color:#116CEF'>จะซื้อจะขาย</b>";
					break;
			};
			$temp = array(
				"i_type"                    => 1,
				"no"                        => ++$no,
				"sp_tor_id"                 => $row["sp_tor_id"],
				"dc_department"             => $row["dc_department"],
				"tor_type"                  => $row["tor_type"],
				"sp_emp_id"                 => $row["sp_emp_id"],
				"dc_cost2_id"               => $row["dc_cost2_id"],
				"sp_emp"                    => $row["sp_emp"],
				"sp_status_hdr"             => $row["sp_status_hdr"],
				"po_expense"                => $row["po_expense"],
				"dc_expense_budget_type"    => $row["dc_expense_budget_type"],
				"i_product_type"            => $i_product_type,
				"i_purchase"                => $i_purchase,
				"i_type_contract"           => $i_type_contract,
				"po_code"                   => $row["po_code"],
				"c_code"                    => $row["c_code"],
				"c_name"                    => $row["c_name"],
				"f_total_amt"               => $row["f_total_amt"],
				"i_pr_year"                 => $row["i_pr_year"],
				"i_enabled"                 => $row["i_enabled"],
				"i_type_bg"                 => $row["i_type_bg"],
				"index_receive"             => $row["index_receive"],
				"d_doc_ref"                 => $row["d_doc_ref"],
				"c_arrive_code"             => $row["chk_code"],
				"po_working_hdr_id"             => $row["po_working_hdr_id"],



				// "f_total"							=> $row["f_amt"],
				// "dc_expense_budget_type"			=> $row["dc_expense_budget_type"],
				// "bg_expense"						=> $row["bg_expense"],
				// "sp_status_hdr"						=> $row["sp_status_hdr"],
				// "f_total_pr"						=> $row["f_total_pr"],
				// "f_total_contract"					=> $row["f_total_contract"],
				// "f_total_pr_contract"				=> $row["f_total_pr_contract"],
				// "c_name_lv4"					=> $row["c_code_lv4"] . " : " . $row["c_name_lv4"],
			);
			${$root}[]	= $temp;
			$f_total_amt += $row["f_total_amt"];
			// $f_sum += $row["f_sum"];
			// $f_total_pr += $row["f_total_pr"];
			// $f_total_contract += $row["f_total_contract"];
			// $f_total_pr_contract += $row["f_total_pr_contract"];
		}
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 4,
			// "f_sum"							=> $f_sum,
			"f_total_amt"				=> $f_total_amt,
			// "f_total_pr"					=> $f_total_pr,
			// "f_total_contract"				=> $f_total_contract,
			// "f_total_pr_contract"			=> $f_total_pr_contract
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
