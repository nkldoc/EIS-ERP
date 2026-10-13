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

	$i_tor_type = $_REQUEST["chart"] ?? 0;
	$year_en = ($_REQUEST["year_en"] > 0) ?   " AND  a.i_pr_year =  {$_REQUEST["year_en"]}" : '';
	$detailMap = [];
	$sqlDetail = "SET NOCOUNT ON 
SELECT *
 into #tem
FROM (
    SELECT
        aa.chk_id,
        aa.po_working_hdr_id,
        pwi_020.d_doc_date AS pwi_020d_doc_date,
        pwi_050.d_doc_date AS pwi_050d_doc_date,
        ROW_NUMBER() OVER (PARTITION BY aa.po_working_hdr_id ORDER BY aa.chk_id ASC) AS rn
    FROM NMU_EIS..po_working_begin_hdr aa
    INNER JOIN NMU_EIS..po_working_dtl bb ON aa.po_working_hdr_id = bb.po_working_hdr_id
    LEFT JOIN NMU_EIS..po_working_item pwi_020 ON pwi_020.i_sub_status = '0.20' AND pwi_020.po_working_hdr_id = aa.po_working_hdr_id
    LEFT JOIN NMU_EIS..po_working_item pwi_050 ON pwi_050.i_sub_status = '0.50' AND pwi_050.po_working_hdr_id = aa.po_working_hdr_id
    WHERE aa.chk_id IS NOT NULL and  pwi_050.d_doc_date IS NOT NULL
        and bb.i_budget_year = 2025
        AND (pwi_050.d_doc_date IS NOT NULL OR pwi_020.d_doc_date IS NOT NULL)
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
	
	FROM sp_tor_contract a 
    left join dbo.sp_tor_hdr_period c on a.sp_tor_contract_id = c.sp_tor_contract_id and isnull(c.i_enabled,1) =1
    left join dbo.sp_check_period_hdr d on c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id
    left join dbo.sp_check_period_dtl e on d.sp_check_period_hdr_id = e.sp_check_period_hdr_id
    left join dbo.sp_check_billing_items ee on e.sp_check_period_hdr_id = ee.sp_check_period_hdr_id
    --  left join dbo.sp_tranf_item f on f.sp_check_period_dtl_id = e.sp_check_period_dtl_id and f.i_enabled = 1
    left join dbo.sp_withdraw  fg on fg.sp_check_period_hdr_id = d.sp_check_period_hdr_id
    left join #tem pwi_070 on  pwi_070.po_working_hdr_id = d.po_working_hdr_id
    left join NMU_EIS.dbo.po_working_hdr g on g.po_working_hdr_id = pwi_070.po_working_hdr_id and g.i_enable = 1
    left join NMU_EIS.dbo.po_working_dtl gg on gg.po_working_hdr_id = g.po_working_hdr_id and g.i_enable = 1
    left join dbo.vw_doc_d_pay_gx_for_nmuerp h on h.c_request_desc_user_key = fg.c_code_ref
where 1=1
and a.sp_tor_id = 275

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
 					,case when a.i_enabled = 1 then 'ใช้งาน' else 'ไม่ใช้งาน' end as  i_enabled
					from sp_tor  a
					LEFT JOIN sp_tor_contract b on a.tor_id = b.sp_tor_id  
					LEFT JOIN sp_emp bb on a.sp_emp_id = bb.sp_emp_id 
						WHERE a.c_code = 'PR25651000049'
					order by a.tor_status_id
";
	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {
		$no = 0;
		$f_total_amt = 0;
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
			}
			$sp_tor_id = $row['sp_tor_id'];
			$f_total_amt = 0;
			$temp = array(
				"i_type"                        => 1,
				"no"                            => ++$no,
				"tor_id"                        => $sp_tor_id,
				"sp_tor_id"                     => $row["sp_tor_id"],
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
				"children"      => isset(
					$detailMap[$sp_tor_id]
				) ? $detailMap[$sp_tor_id] : [],
			);
			${$root}[]	= $temp;
			$f_total_amt += $row["f_total_amt"];
		}
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 4,
			"f_total_amt"				=> $f_total_amt,

		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
