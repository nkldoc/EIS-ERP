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
	$i_enabled =  ($_REQUEST["i_enabled"] == 1) ? ' AND a.i_enabled = 1' : ' ';

	$str = str_replace(";", ",", $_REQUEST['sp_emp_id'], $count);
	$emp_arr = explode(',', $str);
	if ($emp_arr[0] == 0) {
		$sp_emp =  "";
	} else {
		$sp_emp =  " and a.sp_emp_id in (" . $str . ") ";
	}

	// d_date_start
	$i_tor_type = $_REQUEST["chart"] ?? 0;
	$year_en = ($_REQUEST["year_en"] > 0) ?   " AND  a.i_pr_year =  {$_REQUEST["year_en"]}" : '';
	$d_date_start = ($_REQUEST["d_date_start"] > 0) ?
		" AND ISNULL(CONVERT(varchar(10), (select top 1 d_tor_status_date from sp_tor_item where sp_status_hdr_id = 13 AND tor_id = a.tor_id ORDER BY id desc  ), 120),
                CONVERT(varchar(10), (select top 1 d_tor_before_status_date from sp_tor_item where sp_status_hdr_id = 26 AND tor_id = a.tor_id ORDER BY id desc  ), 120)
                )  >= '{$_REQUEST["d_date_start"]}'"
		: '';
	$type_report_row = $_REQUEST["type_report_row"] ?? 0;
	$detailMap = [];
	switch ($type_report_row) {
		// case 0:
		// $where = " ";
		// break;
		case "reportsemp":
			$where = $sp_emp;
			$Column ='';
			$where2 ='';
			$JOIN  ='';
			break;
		case 'f_reserve_budget': // ครุภัณฑ์ 
			$where = ' '    ;
			$Column = ' ,cc.f_amt as  f_amt';
			$where2 = '   AND cc.bg_reserve_money_id > 0  AND cc.i_year = '."'" . $_REQUEST["year_en"]."'" .'  AND cc.dc_budget_type_id = 2    AND cc.bg_expense_id =  '."'" . $_REQUEST["bg_expense_id"]."'"  ;
			$JOIN = ' LEFT JOIN NMU_EIS..bg_reserve_money cc 
    ON cc.pr_id = a.tor_id AND cc.i_sys = 1 AND cc.i_enable = 1 
    AND cc.i_reserve = (
        SELECT TOP 1 i_reserve
        FROM NMU_EIS..bg_reserve_money
        WHERE pr_id = a.tor_id AND i_sys = 1 AND i_enable = 1 AND i_reserve IN (2, 1)
        ORDER BY CASE i_reserve WHEN 2 THEN 0 ELSE 1 END
    )  ';
			break;
			// case 'i_product_type2': // วัสดุ
			// 	$where = ' AND  isnull(a.i_product_type,0) = 1 ';
			// 	break;
			// case 'i_product_type3': // จ้าง ไม่ได้ของ
			// 	$where = ' AND isnull(a.i_type_bg,0) <> 2 AND  isnull(a.i_product_type,0) = 0 AND isnull(a.i_purchase,0) = 2  ';
			// 	break;
			// case 'i_product_type4': // เช่า ไม่ได้ของ
			// 	$where = ' AND  isnull(a.i_product_type,0) = 0 AND isnull(a.i_purchase,0) = 3 ';
			// 	break;
			// case 'i_product_type5': // โครงการต่อเนื่อง
			// 	$where = ' AND isnull(a.i_type_bg,0) = 2   ';
			// 	break;
			// case 'i_product_type6': // จะซื้อจะขาย
			// 	$where = ' AND isnull(a.i_type_contract,0) = 3   ';
			// 	break;
			// case 'i_product_type7': // โครงการก่อสร้าง
			// 	$where = ' AND  isnull(a.i_product_type,0) = 0  ';
			// 	break;
			// case 'i_product_type8': // รวม
			// 	$where = ' AND a.c_code is not null ';
			// 	break;
	}
	$sqlDetail = "SET NOCOUNT ON 
SELECT *
 into #tem
FROM (
    SELECT
        aa.chk_id,
        aa.po_working_hdr_id,
        pwi_020.d_doc_date AS pwi_020d_doc_date,
        pwi_050.d_doc_date AS pwi_050d_doc_date,
		pwi_last.c_file_pdf_hdr,
        pwi_last.c_file_pdf_dtl,
        ROW_NUMBER() OVER (PARTITION BY aa.po_working_hdr_id ORDER BY aa.chk_id ASC) AS rn
    FROM NMU_EIS..po_working_begin_hdr aa
    INNER JOIN NMU_EIS..po_working_hdr bb ON aa.po_working_hdr_id = bb.po_working_hdr_id
    LEFT JOIN NMU_EIS..po_working_item pwi_020 ON pwi_020.i_sub_status = '0.20' AND pwi_020.po_working_hdr_id = aa.po_working_hdr_id
    LEFT JOIN NMU_EIS..po_working_item pwi_050 ON pwi_050.i_sub_status = '0.50' AND pwi_050.po_working_hdr_id = aa.po_working_hdr_id
    LEFT JOIN NMU_EIS..po_working_item pwi_last ON pwi_last.i_sub_status = bb.i_sub_status AND pwi_last.po_working_hdr_id = aa.po_working_hdr_id
	WHERE 
    aa.chk_id IS NOT NULL 
    and  bb.i_enable =1 
) t
WHERE rn = 1;

	
SELECT 
ROW_NUMBER() OVER(ORDER BY a.c_code,c.i_period  ASC) as row
,a.sp_tor_id
,a.c_code as po_code 
,c.i_period  
 ,a.sp_tor_contract_id
 ,a.parent_id
 , isnull(c.i_period,0) as i_period
,CONVERT(varchar(10), d.d_arrive_date, 120) AS d_arrive_date
,CONVERT(varchar(10), d.d_checking_date, 120) AS d_checking_date
, case when  fg.sp_check_period_hdr_id is not null  then  CONVERT(date,fg.d_doc_date)  else     CONVERT(date,g.d_create) end  as d_doc_withdraw
 ,a.c_name
 , ( select c_name from  sp_department where dc_department_id = (select  dc_department_id from sp_emp where sp_emp_id = a.sp_emp_id ) )  as dc_department
 , case when d_arrive_date is  null then 'รอรับของ'
 when d.c_code is null  and d.d_arrive_date is not null  then 'รอทำการตรวจรับ'
 when d.c_code is not null and d.d_arrive_date is not null and g.c_code_ref is null   then 'รอส่งเบิก'
 when d.c_code is not null   and g.c_code_ref is not null  then 'ส่งเบิกฝ่ายคลัง'
 when isnull(g.c_code_ref,'') != '' then 'ส่งเบิกฝ่ายคลัง'
 else '' end as stats_period
  ,case when  isnull(a.parent_id,0) > 0 then  (select c_code from sp_tor_contract where sp_tor_contract_id = a.parent_id )
  else a.c_code end as c_code
 , case when  i_is_last = 1 and g.c_code_ref is not null then 'ปิดสัญญาแล้ว'
  else 'กำลังดำเนินการ' end as stats_con
 , (select inv_name from NMU..dc_creditor where dc_creditor_id = a.dc_creditor_id  ) as dc_creditor_name
 , isnull(a.f_total_amt,0) as f_total_amt
 , isnull(a.f_type_amt,0) as f_type_amt
 , isnull(a.f_total_amt,0) as f_total_amt
,convert(varchar,a.d_doc_date,120) as  d_doc_date
,convert(varchar,a.d_due_date,120) as d_due_date
 ,(select c_name from sp_emp where sp_emp_id = a.sp_emp_id) as sp_emp
 ,case when d.c_arrive_code is not null  then    isnull(c.f_total_amt,0) else null end as f_period
 ,case when d.c_code is not null  then      e.f_net_total_price else null end as f_chk2
,d.c_arrive_code
, d.c_code as  c_code_chk
, e.f_net_total_price  as f_chk
, isnull(c.f_total_amt,0)  as f_period 
,h.c_approve
, case when  fg.sp_check_period_hdr_id is not null  then  fg.f_total  else    gg.f_total end as f_withdraw
, case when  fg.sp_check_period_hdr_id is not null  then  fg.c_code_ref  else    g.c_code_ref end as c_code_ref
, case when  fg.sp_check_period_hdr_id is not null  then  fg.c_invoice  else     ee.c_doc_ref end  as c_invoice
, d.c_doc_ref as c_doc_ref
, case when  fg.sp_check_period_hdr_id is not null  then  h.c_impv_code  else  gg.c_code_pv end  as c_impv_code
, case when  fg.sp_check_period_hdr_id is not null  then  h.d_pay  else  CONVERT(date,gg.d_pv_date) end  as d_pay
, case when  fg.sp_check_period_hdr_id is not null  then  h.f_inv  else  gg.f_total end  as f_inv
,pwi_070.c_file_pdf_hdr
,pwi_070.c_file_pdf_dtl
	FROM sp_tor_contract a 
    left join dbo.sp_tor_hdr_period c on a.sp_tor_contract_id = c.sp_tor_contract_id and isnull(c.i_enabled,1) =1
    left join dbo.sp_check_period_hdr d on c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id
    left join dbo.sp_check_period_dtl e on d.sp_check_period_hdr_id = e.sp_check_period_hdr_id
    left join dbo.sp_check_billing_items ee on e.sp_check_period_hdr_id = ee.sp_check_period_hdr_id
    --  left join dbo.sp_tranf_item f on f.sp_check_period_dtl_id = e.sp_check_period_dtl_id and f.i_enabled = 1
    left join dbo.sp_withdraw  fg on fg.sp_check_period_hdr_id = d.sp_check_period_hdr_id
	left join #tem pwi_070 on  pwi_070.chk_id = d.sp_check_period_hdr_id
    left join NMU_EIS.dbo.po_working_hdr g on g.po_working_hdr_id = pwi_070.po_working_hdr_id and g.i_enable = 1
    left join NMU_EIS.dbo.po_working_dtl gg on gg.po_working_hdr_id = g.po_working_hdr_id and g.i_enable = 1
    left join dbo.vw_doc_d_pay_gx_for_nmuerp h on h.c_request_desc_user_key = fg.c_code_ref
where 1=1
AND a.i_enabled = 1
{$where}

order by c.i_period

/******drop temp******/
DECLARE @sql NVARCHAR(MAX);
SELECT @sql = STRING_AGG('IF OBJECT_ID(''tempdb..' + QUOTENAME(name) + ''') IS NOT NULL DROP TABLE ' + QUOTENAME(name), '; ')
FROM tempdb.sys.objects
WHERE name LIKE '#%';
IF @sql IS NOT NULL
 EXEC sp_executesql @sql;
/********************/
		";
	$stmtDetail = $db->QueryParam($sqlDetail, array());
	while ($row = $db->Fetch($stmtDetail)) {
		$sp_tor_id = $row['sp_tor_id'];
		$detailMap[$sp_tor_id][] = $row; // เก็บ array งวดไว้ตาม key
	}

	$sqlMain = "SET NOCOUNT ON 
					select 
					a.sp_emp_id
					{$Column} 
					,a.tor_id as sp_tor_id
                    ,isnull((select c_name from sp_department where bb.dc_department_id = dc_department_id ),'ยังไม่ได้ระบุ')as dc_department
					,isnull((select c_name from sp_emp where a.sp_emp_id = sp_emp_id ),'ยังไม่ได้ระบุ') as  sp_emp
					,(select c_name from sp_status_hdr where a.tor_status_id = sp_status_hdr_id ) as sp_status_hdr
					,a.c_name 
					,(select c_name from sp_type_status where sp_type_status_id = a.tor_type_id ) as tor_type
					,a.c_code 
                    ,isnull(a.i_product_type,0) as i_product_type 
                    ,ISNULL(
                        CONVERT(varchar(10), (select top 1 d_tor_status_date from sp_tor_item where sp_status_hdr_id = 13 AND tor_id = a.tor_id ORDER BY id desc  ), 120),
                        CONVERT(varchar(10), (select top 1 d_tor_before_status_date from sp_tor_item where sp_status_hdr_id = 26 AND tor_id = a.tor_id ORDER BY id desc  ), 120)
                    )   as sp_status_hdr13
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
					,isnull(c.po_working_hdr_id,0) as po_working_hdr_id 
                 	,case when  isnull(c.po_working_hdr_id,0) > 0  THEN 1 ELSE 0 END  as po_working_hdr_status -- 1 เบิกงวดสุดท้ายแล้ว 0 ยัง
					,CONVERT(varchar(10), c.pwi_050d_doc_date, 120) AS pwi_050d_doc_date
 					,case when a.i_enabled = 1 then 'ใช้งาน' else 'ไม่ใช้งาน' end as  i_enabled
					from sp_tor  a
					LEFT JOIN sp_tor_contract b on a.tor_id = b.sp_tor_id   and b.i_enabled = 1
					LEFT JOIN sp_emp bb on a.sp_emp_id = bb.sp_emp_id 
					LEFT JOIN NMU_DATACENTER..vw_sp_status_tor_po c on c.sp_tor_contract_id  = b.sp_tor_contract_id and c.i_is_last = 1 
					{$JOIN}
					 WHERE a.i_type_bg <> 10
					 AND  a.i_enabled = 1
					 AND a.c_code is not null
					 {$year_en}
					 {$d_date_start}
					 {$where}
					 {$where2}
					order by a.tor_status_id
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
		$po_working_hdr_status = 0;
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
			switch (intval($row["po_working_hdr_status"])) {
				case 0:
					$po_working_hdr_status = "<b style='color:#CD5C5C'>งวดสุดท้าย-ยังไม่ถูกเบิก</b>";
					break;
				case 1:
					$po_working_hdr_status = "<b style='color:#116CEF'>งวดสุดท้าย-เบิกแล้ว</b>";
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
			}
			$sp_tor_id = $row['sp_tor_id'];
			$f_total_amt = 0;
			$temp = array(
				"i_type"                        => 1,
				"no"                            => ++$no,
				"tor_id"                        => $sp_tor_id,
				"sp_tor_id"                     => $row["sp_tor_id"],
				"sp_tor_id"                     => $row["sp_tor_id"],
				"dc_department"                 => $row["dc_department"],
				"sp_status_hdr13"               => $row["sp_status_hdr13"],
				"tor_type"                      => $row["tor_type"],
				"sp_emp_id"                     => $row["sp_emp_id"],
				"dc_cost2_id"                   => $row["dc_cost2_id"],
				"sp_emp"                        => $row["sp_emp"],
				"sp_status_hdr"                 => $row["sp_status_hdr"],
				"po_expense"                    => $row["po_expense"],
				"dc_expense_budget_type"        => $row["dc_expense_budget_type"],
				"i_product_type"                => $i_product_type,
				"i_purchase"                    => $i_purchase,
				"i_type_contract"               => $i_type_contract,
				"po_code"                       => $row["po_code"],
				"c_code"                        => $row["c_code"],
				"c_name"                        => $row["c_name"],
				"f_total_amt"                   => $row["f_total_amt"],
				"f_amt"                   		=> $row["f_amt"]??0 ,
				"i_pr_year"                     => $row["i_pr_year"],
				"i_enabled"                     => $row["i_enabled"],
				"i_type_bg"                     => $row["i_type_bg"],
				"index_receive"                 => $row["index_receive"],
				"d_doc_ref"                     => $row["d_doc_ref"],
				"po_working_hdr_status"         => $po_working_hdr_status,
				"po_working_hdr_status_int"     => $row["po_working_hdr_status"],
				"pwi_050d_doc_date"     		=> $row["pwi_050d_doc_date"],

				"children"      => isset(
					$detailMap[$sp_tor_id]
				) ? $detailMap[$sp_tor_id] : [],
			);
			${$root}[]	= $temp;
			$f_total_amt += $row["f_total_amt"];
		}
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
