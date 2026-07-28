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
	if( $_REQUEST["i_year"] > 2024  ){
		$DBNAME =  DB_NMU_EIS;
	} else {
		$DBNAME =  DB_NMU;
	}
	$DBNAME_ERP =  "NMU_ERP..";
	$DBNAME_ERP_EIS =  "EIS_PROCURE..";
	global $db, $date, $root, $data, $con, $arr_status;

	$con_1 = null;
	$totalCount = 0;

	$budget1 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND aa.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";
	$budget2 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND bb.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";
	$budget3 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND aa.dc_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";
	$budget4 = ($_REQUEST["dc_expense_budget_type_id"]>0 ) ? " and CASE WHEN aa.i_purchase =1 THEN f.dc_bg_budget_type_id ELSE a.bg_type_id END = {$_REQUEST["dc_expense_budget_type_id"]}": "";

	$cost1 = ($_REQUEST["dc_cost_id"] > 0) ? " AND aa.dc_cost_id = {$_REQUEST["dc_cost_id"]}" : "";
	$cost2 = ($_REQUEST["dc_cost_id"] > 0) ? " AND bb.dc_cost_id = {$_REQUEST["dc_cost_id"]}" : "";
	$cost3 = ($_REQUEST["dc_cost_id"] > 0) ? " AND CASE WHEN ISNULL(bb.dc_cost_ref_id,0) = 0 THEN bb.dc_cost_id ELSE bb.dc_cost_ref_id END = {$_REQUEST["dc_cost_id"]}" : "";

	$Income_Lv = $_REQUEST["i_year"] < 2022 ? '2' : '4';
	$Income_Lv_null = $_REQUEST["i_year"] < 2022 ? '_lv2' : '';
	$Lv4_enable = $_REQUEST["i_year"] < 2022 ? '--' : '';
	$Lv2_enable = $_REQUEST["i_year"] < 2022 ? '' : '--';

	if ($_REQUEST["i_expense"] == 1) {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv1"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND cc.bg_expense_lv1_id IN (" . $in . ")" : "";
				$con_1 .= ($in != "") ? " AND cc.bg_expense_lv1_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST["i_expense"] == 2) {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv2"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND cc.bg_expense_lv2_id IN (" . $in . ")" : "";
				$con_1 .= ($in != "") ? " AND cc.bg_expense_lv2_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST["i_expense"] == 3) {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv3"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND cc.bg_expense_lv3_id IN (" . $in . ")" : "";
				$con_1 = ($in != "") ? " AND cc.bg_expense_lv{$Income_Lv}_id IN (SELECT a.bg_expense_lv{$Income_Lv}_id FROM #temp_vw_bg_expense_with_parent a WHERE a.bg_expense_lv3_id IN (" . $in . "))" : "";
			}
		}
	} else {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv4"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND cc.bg_expense_lv4_id IN (" . $in . ")" : "";
				$con_1 = ($in != "") ? " AND cc.bg_expense_lv{$Income_Lv}_id IN (SELECT a.bg_expense_lv{$Income_Lv}_id FROM #temp_vw_bg_expense_with_parent a WHERE a.bg_expense_lv4_id IN (" . $in . "))" : "";
			}
		}
	}

	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @i_year AS numeric = {$_REQUEST["i_year"]};
		select * into #temp_vw_bg_expense_with_parent from {$DBNAME}vw_bg_expense_with_parent

		/* งบประมาณตามบัญชีจัดสรร */
		SELECT
			bb.bg_expense_id
			,cc.bg_expense_lv2_id
			,SUM(ISNULL(bb.f_total, 0)) AS f_total
		INTO #tempBudget
		FROM {$DBNAME}bg_budget_hdr_plan aa
			INNER JOIN {$DBNAME}bg_budget_dtl_plan bb ON aa.bg_budget_hdr_plan_id = bb.bg_budget_hdr_plan_id
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1
			AND aa.i_year = @i_year
			AND bb.f_total != 0
			{$con} {$budget1}
			".($_REQUEST["i_year"] >= 2024 ? 	$cost2 : "")."
			GROUP BY bb.bg_expense_id, bg_expense_lv2_id;
		
		/* รอจองเงินอุดหนุน (ยังไม่ให้ทำสัญญา) */
		/*select
		isnull(aa.po_expense_id,0) as po_expense_id
		,SUM(ISNULL(aa.f_total_amt, 0)) AS f_total_erp
		INTO #tempBudget_period_bg
	from {$DBNAME_ERP}sp_tor  aa
	RIGHT  join {$DBNAME_ERP}sp_tor_item bb on aa.tor_id = bb.tor_id
	INNER JOIN #temp_vw_bg_expense_with_parent cc ON aa.po_expense_id = cc.bg_expense_lv4_id
	where aa.i_period_bg = 1 
		and aa.bg_reserve_money1_id is null 
		and bb.sp_status_hdr_id= 13 
		and isnull(aa.po_expense_id,0) > 0
		and aa.i_yyyy =  @i_year
		and aa.i_type_bg =  1
		{$con} {$budget1}
	group by aa.po_expense_id*/

	select isnull(aa.po_expense_id,0) as po_expense_id 
	,sum(CASE WHEN aa.i_purchase =1 THEN f.f_unit_price ELSE a.f_type_amt END) AS f_total_erp
	INTO #tempBudget_period_bg
	from vw_sp_budget_type3 a
	left join dbo.sp_tor aa on aa.tor_id=a.tor_id
	left join dbo.sp_tor_dtl f on f.sp_tor_id=aa.tor_id 
	right join {$DBNAME_ERP}sp_tor_item bb on aa.tor_id = bb.tor_id
	INNER JOIN #temp_vw_bg_expense_with_parent cc ON aa.po_expense_id = cc.bg_expense_lv4_id
	where aa.i_period_bg = 1 
		and aa.bg_reserve_money1_id is null 
		and bb.sp_status_hdr_id= 13 
		and isnull(aa.po_expense_id,0) > 0
		and aa.i_yyyy =  @i_year
		and a.bg_type_id > 0
		and aa.i_type_bg =  1
		and aa.i_enabled = 1 
		{$budget4} {$con}
	
	group by aa.po_expense_id

	/* เงินจอง PR แผน นับจากการจอง PR */
	select  
	isnull(aa.bg_expense_id,0) as po_expense_id
		,SUM(ISNULL(aa.f_amt, 0)) AS f_total_pr_type1
		INTO #tempBudget_sum_pr_type1
	from {$DBNAME} bg_reserve_money aa
	INNER JOIN #temp_vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
	where aa.i_reserve =  1 and aa.i_enable = 1   and i_pr_type = 1 
	and aa.i_year =  @i_year --  and dc_budget_type_id = 4  and 
	{$con} {$budget3}
	".($_REQUEST["i_year"] >= 2024 ? 	$cost1 : "")."
	group by aa.bg_expense_id 

	/* เงินจอง PR งวด นับจากการจอง PR */
	select  
	isnull(aa.bg_expense_id,0) as po_expense_id
		,SUM(ISNULL(aa.f_amt, 0)) AS f_total_pr_type2
		INTO #tempBudget_sum_pr_type2
	from {$DBNAME}bg_reserve_money aa
	INNER JOIN #temp_vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
	where aa.i_reserve =  1 and aa.i_enable = 1   and i_pr_type = 2 
	and aa.i_year =  @i_year --  and dc_budget_type_id = 4  and 
	{$con} {$budget3}
	".($_REQUEST["i_year"] >= 2024 ? 	$cost1 : "")."
	group by aa.bg_expense_id

		/* เงินจอง PR ทั้งหมด นับจากการจอง PR */
		select  
		isnull(aa.bg_expense_id,0) as po_expense_id
			,SUM(ISNULL(aa.f_amt, 0)) AS f_total_rev
			INTO #tempBudget_sum_reserve1
		from {$DBNAME}bg_reserve_money aa
        INNER JOIN #temp_vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
		where aa.i_reserve =  1 and aa.i_enable = 1  
		and aa.i_year =  @i_year --  and dc_budget_type_id = 4  and 
		{$con} {$budget3}
		".($_REQUEST["i_year"] >= 2024 ? 	$cost1 : "")."
		group by aa.bg_expense_id 

		/* โอนเปลี่ยนแปลง */
		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_change, 0)) AS f_total_D
			INTO #tempDiscount
		FROM {$DBNAME} bg_budget_hdr_change aa
			INNER JOIN {$DBNAME} bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id and ISNULL(bb.i_extenal,0) != 1
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1 
			AND aa.i_year = @i_year 
			AND i_type = 1
			{$con} {$budget1}
			".($_REQUEST["i_year"] >= 2024 ? 	$cost2 : "")."
		GROUP BY bb.bg_expense_id;

		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_change, 0)) AS f_total_E
			INTO #tempExtra
		FROM {$DBNAME} bg_budget_hdr_change aa
			INNER JOIN {$DBNAME} bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id and ISNULL(bb.i_extenal,0) != 1
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1 
			AND aa.i_year = @i_year  
			AND i_type = 2	
			{$con} {$budget1}
			".($_REQUEST["i_year"] >= 2024 ? 	$cost2 : "")."
		GROUP BY bb.bg_expense_id

		select 
			CASE
				WHEN ISNULL(a.bg_expense_id,0) > 0 THEN a.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) > 0 THEN b.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) = 0 and ISNULL(a.bg_expense_id,0) = 0  THEN 0
			END AS bg_expense_id,
			ISNULL(f_total_E, 0) - ISNULL(f_total_D, 0) AS f_total
		INTO #tempBudgetAdjust
		FROM #tempExtra a 
		FULL JOIN #tempDiscount b on ISNULL(a.bg_expense_id,0) = ISNULL(b.bg_expense_id,0)
		WHERE
			CASE
				WHEN ISNULL(a.bg_expense_id,0) > 0 THEN a.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) > 0 THEN b.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) = 0 and ISNULL(a.bg_expense_id,0) = 0  THEN 0
			END > 0
			AND ISNULL(f_total_E, 0) - ISNULL(f_total_D, 0) != 0;

		/* โอนเปลี่ยนแปลงภายในส่วนงาน (บัญชีจัดสรร) */
		SELECT
			*
		INTO #tempBudgetTransfer
		FROM (
			SELECT
				bb.bg_expense_begin_id AS bg_expense_id
				,-SUM(ISNULL(bb.f_total, 0)) AS f_total
			FROM {$DBNAME} bg_budget_hdr_transfer aa
				INNER JOIN {$DBNAME} bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
				INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_begin_id = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1 AND aa.i_transfer = 1
				AND aa.i_year = @i_year
				AND bb.f_total != 0
				{$con} {$budget1}	
			GROUP BY bb.bg_expense_begin_id
			UNION ALL
			SELECT
				bb.bg_expense_end_id AS bg_expense_id
				,SUM(ISNULL(bb.f_total, 0)) AS f_total
			FROM {$DBNAME} bg_budget_hdr_transfer aa
				INNER JOIN {$DBNAME} bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
				INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_end_id = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1 AND aa.i_transfer = 1
				AND aa.i_year = @i_year
				AND bb.f_total != 0
				{$con} {$budget1}
			GROUP BY bb.bg_expense_end_id
		) z;
		/*
		/* งบประมาณโครงการต่อเนื่อง*/
		SELECT
			bb.bg_expense_id
			,cc.bg_expense_lv2_id
			,SUM(ISNULL(bb.f_total, 0)) AS f_total
		INTO #tempBudgetLong
		FROM bg_budget_hdr_long aa
			INNER JOIN bg_budget_dtl_long bb ON aa.bg_budget_hdr_long_id = bb.bg_budget_hdr_long_id
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1
			AND @i_year BETWEEN aa.i_year_start AND aa.i_year_end
			--AND aa.i_year = @i_year
			AND bb.f_total != 0
			{$con} {$budget1}
		GROUP BY bb.bg_expense_id, bg_expense_lv2_id
		*/
		/* เงินประจำงวด */
		SELECT cc.bg_expense_lv4_id, SUM(ISNULL(f_total,0)) AS f_total
		INTO #tempBudget_period
		FROM (
			SELECT
				bb.bg_expense_id_lv4 AS bg_expense_lv4_id
				,bb.bg_budget_dtl_id
				,cc.bg_expense_lv1_id 
				,ISNULL(bb.f_total, 0) AS f_total
			FROM {$DBNAME} bg_budget_hdr aa
				INNER JOIN {$DBNAME} bg_budget_dtl bb ON aa.bg_budget_hdr_id = bb.bg_budget_hdr_id
				INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id_lv4 = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1 
				AND aa.i_year = @i_year
				--AND bb.f_total != 0
				{$con} {$budget1} {$cost2}
			GROUP BY bb.bg_expense_id_lv4, cc.bg_expense_lv1_id, f_total ,bb.bg_budget_dtl_id
		)cc
		WHERE 1=1 
		GROUP BY cc.bg_expense_lv4_id;

		/* โอนเปลี่ยนแปลง เงินประจำงวด*/
		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_change, 0)) AS f_total_D
			INTO #tempDiscount_period
		FROM {$DBNAME} bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_period") . "_change aa
			INNER JOIN {$DBNAME} bg_budget_dtl" . ($_REQUEST["i_year"] >= 2024 ? "" : "_period") . "_change bb ON aa.bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_period") . "_change_id = bb.bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_period") . "_change_id and ISNULL(bb.i_extenal,0) != 1
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1 
			AND aa.i_year = @i_year
			AND i_type = 1	 
			{$con} {$budget1} {$cost2}
		GROUP BY bb.bg_expense_id;

		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_change, 0)) AS f_total_E
			INTO #tempExtra_period
			FROM {$DBNAME} bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_period") . "_change aa
			INNER JOIN {$DBNAME} bg_budget_dtl" . ($_REQUEST["i_year"] >= 2024 ? "" : "_period") . "_change bb ON aa.bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_period") . "_change_id = bb.bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_period") . "_change_id and ISNULL(bb.i_extenal,0) != 1
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1 
			AND aa.i_year = @i_year
			AND i_type = 2
			{$con} {$budget1} {$cost2}
		GROUP BY bb.bg_expense_id

		select 
			CASE
				WHEN ISNULL(a.bg_expense_id,0) > 0 THEN a.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) > 0 THEN b.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) = 0 and ISNULL(a.bg_expense_id,0) = 0  THEN 0
			END AS bg_expense_id,
			ISNULL(f_total_E, 0) - ISNULL(f_total_D, 0) AS f_total
		INTO #tempBudgetAdjust_period
		FROM #tempExtra_period a 
		FULL JOIN #tempDiscount_period b on ISNULL(a.bg_expense_id,0) = ISNULL(b.bg_expense_id,0)
		WHERE
			CASE
				WHEN ISNULL(a.bg_expense_id,0) > 0 THEN a.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) > 0 THEN b.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) = 0 and ISNULL(a.bg_expense_id,0) = 0  THEN 0
			END > 0
			AND ISNULL(f_total_E, 0) - ISNULL(f_total_D, 0) != 0;

		/* เงินรายได้ที่ได้รับจริง */
		SELECT cc.bg_expense_lv4_id, SUM(ISNULL(f_total,0)) AS f_total
		INTO #tempBudgetIncome
		FROM (
			SELECT
				bb.bg_expense_id_lv4 AS bg_expense_lv4_id
				,bb.bg_budget_dtl_income_id
				,cc.bg_expense_lv1_id 
				,ISNULL(bb.f_total, 0) AS f_total
			FROM {$DBNAME} bg_budget_hdr_income aa
				INNER JOIN {$DBNAME} bg_budget_dtl_income bb ON aa.bg_budget_hdr_income_id = bb.bg_budget_hdr_income_id
				INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id_lv4 = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1 
				AND aa.i_year = @i_year
				--AND bb.f_total != 0
				{$con} {$budget1} {$cost2}
			GROUP BY bb.bg_expense_id_lv4, cc.bg_expense_lv1_id, f_total ,bb.bg_budget_dtl_income_id
		)cc
		WHERE 1=1 
		GROUP BY cc.bg_expense_lv4_id;

		/* โอนเปลี่ยนแปลงภายในส่วนงาน (เงินที่ได้รับจริง) */
		SELECT
			*
		INTO #tempIncomeTransfer
		FROM (
			SELECT
				bb.bg_expense_begin_id AS bg_expense_id
				,-SUM(ISNULL(bb.f_total, 0)) AS f_total
			FROM {$DBNAME} bg_budget_hdr_transfer aa
				INNER JOIN {$DBNAME} bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
				INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_begin_id = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1 AND aa.i_transfer = 2
				AND aa.i_year = @i_year
				AND bb.f_total != 0
				{$con} {$budget1}
			GROUP BY bb.bg_expense_begin_id
			UNION ALL
			SELECT
				bb.bg_expense_end_id AS bg_expense_id
				,SUM(ISNULL(bb.f_total, 0)) AS f_total
			FROM {$DBNAME} bg_budget_hdr_transfer aa
				INNER JOIN {$DBNAME} bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
				INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_end_id = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1 AND aa.i_transfer = 2
				AND aa.i_year = @i_year
				AND bb.f_total != 0
				{$con} {$budget1}
			GROUP BY bb.bg_expense_end_id
		) z;
		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_change, 0)) AS f_total_D
			INTO #tempDiscount_income
		FROM {$DBNAME} bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_income") . "_change aa
			INNER JOIN {$DBNAME} bg_budget_dtl" . ($_REQUEST["i_year"] >= 2024 ? "" : "_income") . "_change bb ON aa.bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_income") . "_change_id = bb.bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_income") . "_change_id and ISNULL(bb.i_extenal,0) != 1
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1 
			AND aa.i_year = @i_year
			AND i_type = 1	 
			{$con} {$budget1} {$cost2}
		GROUP BY bb.bg_expense_id;

		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_change, 0)) AS f_total_E
			INTO #tempExtra_income
			FROM {$DBNAME} bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_income") . "_change aa
			INNER JOIN {$DBNAME} bg_budget_dtl" . ($_REQUEST["i_year"] >= 2024 ? "" : "_income") . "_change bb ON aa.bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_income") . "_change_id = bb.bg_budget_hdr" . ($_REQUEST["i_year"] >= 2024 ? "" : "_income") . "_change_id and ISNULL(bb.i_extenal,0) != 1
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1 
			AND aa.i_year = @i_year
			AND i_type = 2
			{$con} {$budget1} {$cost2}
		GROUP BY bb.bg_expense_id

		select 
			CASE
				WHEN ISNULL(a.bg_expense_id,0) > 0 THEN a.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) > 0 THEN b.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) = 0 and ISNULL(a.bg_expense_id,0) = 0  THEN 0
			END AS bg_expense_id,
			ISNULL(f_total_E, 0) - ISNULL(f_total_D, 0) AS f_total
		INTO #tempBudgetAdjust_income
		FROM #tempExtra_income a 
		FULL JOIN #tempDiscount_income b on ISNULL(a.bg_expense_id,0) = ISNULL(b.bg_expense_id,0)
		WHERE
			CASE
				WHEN ISNULL(a.bg_expense_id,0) > 0 THEN a.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) > 0 THEN b.bg_expense_id
				WHEN ISNULL(b.bg_expense_id,0) = 0 and ISNULL(a.bg_expense_id,0) = 0  THEN 0
			END > 0
			AND ISNULL(f_total_E, 0) - ISNULL(f_total_D, 0) != 0;

		/* เบิกจ่ายทั้งสิ้น */
		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_total, 0)) AS f_total
			,SUM(ISNULL(ret.f_return, 0)) AS f_return
			,SUM(CASE WHEN 1=1 {$cost3}
				THEN ISNULL(bb.f_total, 0) 
				ELSE 0 END
			) AS f_total_cost
			,SUM(CASE WHEN 1=1 {$cost3}
				THEN ISNULL(ret.f_return, 0) 
				ELSE 0 END
			) AS f_return_cost
		INTO #tempWorking0
		FROM {$DBNAME} po_working_hdr aa
			INNER JOIN {$DBNAME} po_working_dtl bb ON aa.po_working_hdr_id = bb.po_working_hdr_id
				AND bb.bg_expense_id IS NOT NULL
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
			LEFT JOIN (SELECT po_working_hdr_id ,SUM(isnull(f_return,0)) AS f_return FROM {$DBNAME} po_return WHERE i_enable = 1 GROUP BY po_working_hdr_id) ret ON aa.po_working_hdr_id = ret.po_working_hdr_id
		WHERE aa.i_enable = 1
			AND bb.i_budget_year_overlap = @i_year
			AND bb.f_total != 0
			{$con} {$budget2} 
			{$cost3}
		GROUP BY bb.bg_expense_id;

		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_total, 0)) AS f_total
			,SUM(ISNULL(ret.f_return, 0)) AS f_return
			,SUM(CASE WHEN 1=1 {$cost3}
				THEN ISNULL(bb.f_total, 0) 
				ELSE 0 END
			) AS f_total_cost
			,SUM(CASE WHEN 1=1 {$cost3}
				THEN ISNULL(ret.f_return, 0) 
				ELSE 0 END
			) AS f_return_cost
		INTO #tempWorking1
		FROM {$DBNAME} po_working_hdr aa
			INNER JOIN {$DBNAME} po_working_dtl bb ON aa.po_working_hdr_id = bb.po_working_hdr_id
				AND bb.bg_expense_id IS NOT NULL
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
			INNER JOIN {$DBNAME} po_working_item dd ON aa.po_working_hdr_id = dd.po_working_hdr_id AND dd.i_status = 5
			LEFT JOIN (SELECT po_working_hdr_id ,SUM(isnull(f_return,0))AS f_return FROM {$DBNAME} po_return WHERE i_enable = 1 GROUP BY po_working_hdr_id) ret ON aa.po_working_hdr_id = ret.po_working_hdr_id
		WHERE aa.i_enable = 1
			AND bb.i_budget_year_overlap = @i_year
			AND bb.f_total != 0
			AND dd.d_doc_date BETWEEN '{$_REQUEST["d_date_start1"]}' AND '{$_REQUEST["d_date_end1"]}'
			{$con} {$budget2} 
			{$cost3}
		GROUP BY bb.bg_expense_id;

		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_total, 0)) AS f_total
			,SUM(ISNULL(ret.f_return, 0)) AS f_return
			,SUM(CASE WHEN 1=1 {$cost3}
				THEN ISNULL(bb.f_total, 0) 
				ELSE 0 END
			) AS f_total_cost
			,SUM(CASE WHEN 1=1 {$cost3}
				THEN ISNULL(ret.f_return, 0) 
				ELSE 0 END
			) AS f_return_cost
		INTO #tempWorking2
		FROM {$DBNAME} po_working_hdr aa
			INNER JOIN {$DBNAME} po_working_dtl bb ON aa.po_working_hdr_id = bb.po_working_hdr_id AND bb.i_success = 1
				AND bb.bg_expense_id IS NOT NULL
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
			INNER JOIN {$DBNAME} po_working_item dd ON aa.po_working_hdr_id = dd.po_working_hdr_id AND dd.i_status = 11
			LEFT JOIN (SELECT po_working_hdr_id ,SUM(isnull(f_return,0)) AS f_return FROM {$DBNAME} po_return WHERE i_enable = 1 GROUP BY po_working_hdr_id) ret ON aa.po_working_hdr_id = ret.po_working_hdr_id
		WHERE aa.i_enable = 1
			AND bb.i_budget_year_overlap = @i_year
			AND bb.f_total != 0
			AND dd.d_doc_date BETWEEN '{$_REQUEST["d_date_start2"]}' AND '{$_REQUEST["d_date_end2"]}'
			{$con} {$budget2} 
			{$cost3}
		GROUP BY bb.bg_expense_id;

		SELECT 
			bg_expense_id
			/*เงินจอง แผน*/
			,SUM(CASE WHEN i_pr_type = 1 AND i_reserve != 3 ".($_REQUEST["i_year"] >= 2024 ? 	$cost1 : "")."  THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget
			--,SUM(CASE WHEN cc.c_code_lv1 != '100000000' THEN (CASE WHEN i_pr_type = 1 AND i_reserve != 3 THEN ISNULL(f_amt,0) ELSE 0 end) ELSE 0 END) AS f_reserve_budget
			--,SUM(CASE WHEN cc.c_code_lv1 = '100000000' THEN (CASE WHEN i_pr_type = 1 AND i_reserve != 3 THEN ISNULL(f_amt,0) ELSE 0 end) ELSE 0 END) AS f_reserve_budget_long
			,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 3 AND ISNULL(i_finish,0) = 0 ".($_REQUEST["i_year"] >= 2024 ? 	$cost1 : "")." THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_income
			,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 3 AND ISNULL(i_finish,0) = 1 ".($_REQUEST["i_year"] >= 2024 ? 	$cost1 : "")." THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_income_Finish

			/*เงินจอง งวด*/
			,SUM(CASE WHEN i_pr_type = 2 AND i_reserve != 3 {$cost1} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_period
			,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 3 AND ISNULL(i_finish,0) = 0 {$cost1} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_periodincome
			,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 3 AND ISNULL(i_finish,0) = 1 {$cost1} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_periodfinish

			/*เงินจอง รับจริง*/
			,SUM(CASE WHEN i_reserve = 3 AND ISNULL(i_finish,0) = 0 {$cost1} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_income
			,SUM(CASE WHEN i_reserve = 3 AND ISNULL(i_finish,0) = 1 {$cost1} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_income_Finish
		INTO #tempReserve
		FROM {$DBNAME} vw_bg_reserve_money aa
		INNER JOIN #temp_vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
		WHERE i_year = @i_year
			{$con} {$budget1} 
			--{$cost1}
		GROUP BY 
			i_year
			,bg_expense_id
			--,dc_expense_budget_type_id

		/* รวมข้อมูล */
		SELECT * 
			,(ISNULL(a.f_reserve_budget,0) + ISNULL(a.f_reserve_budget_income,0) + (ISNULL(a.f_working0,0)-ISNULL(a.f_return0,0))) - (ISNULL(a.f_working1,0) - ISNULL(a.f_return1,0)) AS f_sum_work_budget0 /*(A3 + A4 + (D1 - E1)) - (D2 - E2)*/
			,(ISNULL(a.f_reserve_budget,0) + ISNULL(a.f_reserve_budget_income,0) + (ISNULL(a.f_working0,0)-ISNULL(a.f_return0,0))) - (ISNULL(a.f_working2,0) - ISNULL(a.f_return2,0)) AS f_sum_work_budget1 /*(A3 + A4 + (D1 - E1)) - (D3 - E3)*/
			--,(case when ISNULL(a.f_budget_long,0) != 0 then ISNULL(a.f_budget_long,0) - ISNULL(a.f_reserve_budget_long,0) else ISNULL(a.f_budget,0)+ISNULL(a.f_budget_adjust,0) - ISNULL(a.f_reserve_budget,0)+ISNULL(a.f_reserve_budget_income,0) end) - (ISNULL(a.f_working0,0) - ISNULL(a.f_return0,0)) as f_sum_budget0 
			,(ISNULL(a.f_budget,0)+ISNULL(a.f_budget_adjust,0)) - (ISNULL(a.f_reserve_budget,0)+ISNULL(a.f_reserve_budget_income,0)) - (ISNULL(a.f_working0,0) - ISNULL(a.f_return0,0))as f_sum_budget0 /*(A1 + A2) - (A3 + A4) - (D1 - E1)*/
			,(ISNULL(a.f_budget,0)+ISNULL(a.f_budget_adjust,0)) - (ISNULL(a.f_working1,0) - ISNULL(a.f_return1,0))as f_sum_budget1 /*(A1 + A2) - (D2 - E2)*/
			,(ISNULL(a.f_budget,0)+ISNULL(a.f_budget_adjust,0)) - (ISNULL(a.f_working2,0) - ISNULL(a.f_return2,0))as f_sum_budget2 /*(A1 + A2) - (D3 - E3)*/
			,(ISNULL(a.f_budget,0)+ISNULL(a.f_budget_adjust,0)) - (ISNULL(a.f_reserve_budget,0)+ISNULL(a.f_reserve_budget_income,0)) - (ISNULL(a.f_working0,0) - ISNULL(a.f_return0,0)) - ISNULL(a.f_total_erp,0) as f_sum_budget_erp1 /*(A1 + A2) - (A3 + A4) - (D1 - E1)*/

			,CASE WHEN ISNULL(a.f_budget_period,0) != 0 THEN (ISNULL(a.f_reserve_period,0) + ISNULL(a.f_reserve_periodincome,0) + (ISNULL(a.f_working_cost0,0)-ISNULL(a.f_return_cost0,0))) - (ISNULL(a.f_working_cost1,0) - ISNULL(a.f_return_cost1,0)) ELSE 0 END AS f_sum_work_budget_period0 /*(B3 + B4 + (D1 - E1)) - (D2 - E2)*/
			,CASE WHEN ISNULL(a.f_budget_period,0) != 0 THEN (ISNULL(a.f_reserve_period,0) + ISNULL(a.f_reserve_periodincome,0) + (ISNULL(a.f_working_cost0,0)-ISNULL(a.f_return_cost0,0))) - (ISNULL(a.f_working_cost2,0) - ISNULL(a.f_return_cost2,0)) ELSE 0 END AS f_sum_work_budget_period1 /* (B3 + B4 + (D1 - E1)) - (D3 - E3)*/
			,CASE WHEN ISNULL(a.f_budget_period,0) != 0 THEN (ISNULL(a.f_budget_period,0)+ISNULL(a.f_budgetadjust_period,0)) - (ISNULL(a.f_reserve_period,0) + ISNULL(a.f_reserve_periodincome,0)) - (ISNULL(a.f_working_cost0,0) - ISNULL(a.f_return_cost0,0)) ELSE 0 END AS f_sum_budget_period0 /*(B1 + B2) - (B3 + B4) - (D1 - E1)*/
			,CASE WHEN ISNULL(a.f_budget_period,0) != 0 THEN (ISNULL(a.f_budget_period,0)+ISNULL(a.f_budgetadjust_period,0)) - (ISNULL(a.f_working_cost1,0) - ISNULL(a.f_return_cost1,0)) ELSE 0 END AS f_sum_budget_period1 /*(B1 + B2) - (D2 - E2)*/
			,CASE WHEN ISNULL(a.f_budget_period,0) != 0 THEN (ISNULL(a.f_budget_period,0)+ISNULL(a.f_budgetadjust_period,0)) - (ISNULL(a.f_working_cost2,0) - ISNULL(a.f_return_cost2,0)) ELSE 0 END AS f_sum_budget_period2 /*(B1 + B2) - (D3 - E3)*/
			,CASE WHEN ISNULL(a.f_budget_period,0) != 0 THEN (ISNULL(a.f_budget_period,0)+ISNULL(a.f_budgetadjust_period,0)) - (ISNULL(a.f_reserve_period,0) + ISNULL(a.f_reserve_periodincome,0) +  ISNULL(a.f_total_erp,0)) - (ISNULL(a.f_working_cost0,0) - ISNULL(a.f_return_cost0,0) )   ELSE 0 END AS f_sum_budget_erp /*(B1 + B2) - (B3 + B4) - (D1 - E1)*/

			,(ISNULL(a.f_reserve_income,0) + (ISNULL(a.f_working_cost0,0)-ISNULL(a.f_return_cost0,0))) - (ISNULL(a.f_working_cost1,0) - ISNULL(a.f_return_cost1,0)) AS f_sum_work_budget_income0 /*(C3 + (D1 - E1)) - (D2 - E2)*/
			,(ISNULL(a.f_reserve_income,0) + (ISNULL(a.f_working_cost0,0)-ISNULL(a.f_return_cost0,0))) - (ISNULL(a.f_working_cost2,0) - ISNULL(a.f_return_cost2,0)) AS f_sum_work_budget_income1 /*(C3 + (D1 - E1)) - (D3 - E3)*/
			,(ISNULL(a.f_budget_income,0) + ISNULL(a.f_income_transfer,0)) - (ISNULL(a.f_reserve_income,0)) - (ISNULL(a.f_working_cost0,0) - ISNULL(a.f_return_cost0,0)) AS f_sum_budget_income0 /*(C1 + C2) - (C3) - (D1 - E1)*/
			,(ISNULL(a.f_budget_income,0) + ISNULL(a.f_income_transfer,0)) - (ISNULL(a.f_working_cost1,0) - ISNULL(a.f_return_cost1,0))as f_sum_budget_income1 /*(C1 + C2) - (D2 - E2)*/
			,(ISNULL(a.f_budget_income,0) + ISNULL(a.f_income_transfer,0)) - (ISNULL(a.f_working_cost2,0) - ISNULL(a.f_return_cost2,0))as f_sum_budget_income2 /*(C1 + C2) - (D3 - E3)*/
		INTO #tempData
		FROM (
			SELECT
				CASE
				WHEN a.bg_expense_id IS NOT NULL THEN a.bg_expense_id
				WHEN b.bg_expense_id IS NOT NULL THEN b.bg_expense_id
				WHEN c.bg_expense_id IS NOT NULL THEN c.bg_expense_id
				--WHEN bl.bg_expense_id IS NOT NULL THEN bl.bg_expense_id
				
				WHEN d.bg_expense_lv4_id IS NOT NULL THEN d.bg_expense_lv4_id
				WHEN e.bg_expense_id IS NOT NULL THEN e.bg_expense_id
				
				WHEN f.bg_expense_lv4_id IS NOT NULL THEN f.bg_expense_lv4_id
				WHEN g.bg_expense_id IS NOT NULL THEN g.bg_expense_id
				WHEN g0.bg_expense_id IS NOT NULL THEN g0.bg_expense_id
				
				WHEN re.bg_expense_id IS NOT NULL THEN re.bg_expense_id

				WHEN p0.bg_expense_id IS NOT NULL THEN p0.bg_expense_id
				WHEN p1.bg_expense_id IS NOT NULL THEN p1.bg_expense_id
				WHEN p2.bg_expense_id IS NOT NULL THEN p2.bg_expense_id
				END AS bg_expense_id
				,a.f_total AS f_budget
				,ISNULL(b.f_total,0) + ISNULL(c.f_total,0) AS f_budget_adjust
				--,bl.f_total AS f_budget_long
				--,ISNULL(re.f_reserve_budget_long,0) AS f_reserve_budget_long
				,CASE WHEN ISNULL(re.f_reserve_period,0) = 0 THEN re.f_reserve_budget ELSE re.f_reserve_period + re.f_reserve_budget END AS f_reserve_budget
				,CASE WHEN ISNULL(re.f_reserve_periodincome,0) = 0 THEN re.f_reserve_budget_income ELSE re.f_reserve_periodincome + re.f_reserve_budget_income END AS f_reserve_budget_income
				,CASE WHEN ISNULL(re.f_reserve_periodfinish,0) = 0 THEN re.f_reserve_budget_income_Finish ELSE re.f_reserve_periodfinish +re.f_reserve_budget_income_Finish END AS f_reserve_budget_income_Finish

				,d.f_total AS f_budget_period
				,e.f_total AS f_budgetadjust_period
				,re.f_reserve_period AS f_reserve_period
				,re.f_reserve_periodincome AS f_reserve_periodincome
				,re.f_reserve_periodfinish AS f_reserve_periodfinish


				,f.f_total AS f_budget_income
				,ISNULL(g0.f_total,0) + ISNULL(g.f_total,0) AS f_income_transfer
				,re.f_reserve_income AS f_reserve_income
				,re.f_reserve_income_Finish AS f_reserve_income_Finish

				,p0.f_total_cost AS f_working_cost0
				,p0.f_return_cost AS f_return_cost0

				,p1.f_total_cost AS f_working_cost1
				,p1.f_return_cost AS f_return_cost1

				,p2.f_total_cost AS f_working_cost2
				,p2.f_return_cost AS f_return_cost2

				,p0.f_total AS f_working0
				,p0.f_return AS f_return0

				,p1.f_total AS f_working1
				,p1.f_return AS f_return1

				,p2.f_total AS f_working2
				,p2.f_return AS f_return2

				,erp.f_total_erp

				,rev.f_total_rev
				,pr1.f_total_pr_type1
				,pr2.f_total_pr_type2


			FROM #tempBudget a
			FULL JOIN #tempBudgetAdjust b ON a.bg_expense_id = b.bg_expense_id
			FULL JOIN #tempBudgetTransfer c ON a.bg_expense_id = c.bg_expense_id
			
			FULL JOIN #tempBudget_period d ON a.bg_expense_id = d.bg_expense_lv4_id
			FULL JOIN #tempBudgetAdjust_period e ON a.bg_expense_id = e.bg_expense_id

			FULL JOIN #tempBudgetIncome f ON a.bg_expense_id = f.bg_expense_lv4_id
			FULL JOIN #tempBudgetAdjust_income g0 ON a.bg_expense_id = g0.bg_expense_id
			FULL JOIN #tempIncomeTransfer g ON a.bg_expense_id = g.bg_expense_id

			--FULL JOIN #tempBudgetLong bl ON a.bg_expense_id = bl.bg_expense_id
			FULL JOIN #tempReserve re ON a.bg_expense_id = re.bg_expense_id
			FULL JOIN #tempWorking0 p0 ON a.bg_expense_id = p0.bg_expense_id
			FULL JOIN #tempWorking1 p1 ON a.bg_expense_id = p1.bg_expense_id
			FULL JOIN #tempWorking2 p2 ON a.bg_expense_id = p2.bg_expense_id
			FULL JOIN #tempBudget_period_bg erp ON erp.po_expense_id = a.bg_expense_id
			FULL JOIN #tempBudget_sum_reserve1 rev ON rev.po_expense_id = a.bg_expense_id
			FULL JOIN #tempBudget_sum_pr_type1 pr1 ON pr1.po_expense_id = a.bg_expense_id
			FULL JOIN #tempBudget_sum_pr_type2 pr2 ON pr2.po_expense_id = a.bg_expense_id

		) a


		/* แสดงข้อมูล */
		SELECT
			b.bg_expense_lv1_id AS bg_expense_id
			,1 AS i_level
			,b.c_code_lv1 AS c_code
			,b.c_name_lv1 AS c_name

			,SUM(ISNULL(a.f_budget,0)) AS f_budget  /*(A1)*/
			,SUM(ISNULL(a.f_budget_adjust,0)) AS f_budget_adjust /*(A2)*/
			--,SUM(ISNULL(a.f_budget_long,0)) AS f_budget_long  /*(BL1)*/
			--,SUM(ISNULL(a.f_reserve_budget_long,0)) AS f_reserve_budget_long  /*(BL2)*/
			,SUM(ISNULL(a.f_reserve_budget,0)) AS f_reserve_budget /*(A3)*/
			,SUM(ISNULL(a.f_reserve_budget_income,0)) AS f_reserve_budget_income /*(A4)*/
			,SUM(ISNULL(a.f_reserve_budget_income_Finish,0)) AS f_reserve_budget_income_Finish  /*(A5)*/

			,SUM(ISNULL(a.f_budget_period,0)) AS f_budget_period  /*(B1)*/
			,SUM(ISNULL(a.f_budgetadjust_period,0)) AS f_budgetadjust_period /*(B2)*/
			,SUM(ISNULL(a.f_reserve_period,0)) AS f_reserve_period /*(B3)*/
			,SUM(ISNULL(a.f_reserve_periodincome,0)) AS f_reserve_periodincome /*(B4)*/
			,SUM(ISNULL(a.f_reserve_periodfinish,0)) AS f_reserve_periodfinish  /*(B5)*/

			,SUM(ISNULL(a.f_budget_income,0)) AS f_budget_income /*(C1)*/
			--,(select top 1 sum(f_total) 
			--	from (
			--		select 
			--		bb.bg_expense_lv1_id,bb.bg_expense_lv2_id,aa.f_total
			--		from #tempBudgetIncome aa 
			--		inner join #temp_vw_bg_expense_with_parent bb on bb.bg_expense_lv2_id = aa.bg_expense_lv2_id
			--		where bb.bg_expense_lv1_id = b.bg_expense_lv1_id
			--		group by bb.bg_expense_lv1_id,bb.bg_expense_lv2_id,aa.f_total
			--	) aa
			--) AS f_budget_income /*(C1)*/
			,(SUM(ISNULL(a.f_income_transfer,0))) AS f_income_transfer /*(C2)*/
			,SUM(ISNULL(a.f_reserve_income,0)) AS f_reserve_income /*(C3)*/
			,SUM(ISNULL(a.f_reserve_income_Finish,0)) AS f_reserve_income_Finish /*(C4)*/

			,SUM(ISNULL(a.f_working_cost0,0)) AS f_working_cost0 /**/
			,SUM(ISNULL(a.f_return_cost0,0)) AS f_return_cost0 /**/
			,SUM(ISNULL(a.f_working_cost1,0)) AS f_working_cost1 /**/
			,SUM(ISNULL(a.f_return_cost1,0)) AS f_return_cost1 /**/
			,SUM(ISNULL(a.f_working_cost2,0)) AS f_working_cost2 /**/
			,SUM(ISNULL(a.f_return_cost2,0)) AS f_return_cost2 /**/

			,SUM(ISNULL(a.f_working0,0)) AS f_working0 /*(D1)*/
			,SUM(ISNULL(a.f_return0,0)) AS f_return0 /*(E1)*/
			,SUM(ISNULL(a.f_working1,0)) AS f_working1 /*(D2)*/
			,SUM(ISNULL(a.f_return1,0)) AS f_return1 /*(E2)*/
			,SUM(ISNULL(a.f_working2,0)) AS f_working2 /*(D3)*/
			,SUM(ISNULL(a.f_return2,0)) AS f_return2 /*(E3)*/

			,SUM(ISNULL(a.f_sum_work_budget0,0)) AS f_sum_work_budget0 
			,SUM(ISNULL(a.f_sum_work_budget1,0)) AS f_sum_work_budget1 
			,SUM(ISNULL(a.f_sum_budget0,0)) AS f_sum_budget0 
			--,SUM(ISNULL(a.f_sum_budget_no_long0,0)) AS f_sum_budget_no_long0 
			,SUM(ISNULL(a.f_sum_budget1,0)) AS f_sum_budget1 
			,SUM(ISNULL(a.f_sum_budget2,0)) AS f_sum_budget2 

			,SUM(ISNULL(a.f_sum_work_budget_period0,0)) AS f_sum_work_budget_period0 
			,SUM(ISNULL(a.f_sum_work_budget_period1,0)) AS f_sum_work_budget_period1 
			,SUM(ISNULL(a.f_sum_budget_period0,0)) AS f_sum_budget_period0 
			,SUM(ISNULL(a.f_sum_budget_period1,0)) AS f_sum_budget_period1 
			,SUM(ISNULL(a.f_sum_budget_period2,0)) AS f_sum_budget_period2 

			,SUM(ISNULL(a.f_sum_work_budget_income0,0)) AS f_sum_work_budget_income0 
			,SUM(ISNULL(a.f_sum_work_budget_income1,0)) AS f_sum_work_budget_income1 
			,SUM(ISNULL(a.f_sum_budget_income0,0)) AS f_sum_budget_income0 
			,SUM(ISNULL(a.f_sum_budget_income1,0)) AS f_sum_budget_income1 
			,SUM(ISNULL(a.f_sum_budget_income2,0)) AS f_sum_budget_income2 

			,SUM(ISNULL(a.f_total_erp,0)) AS f_total_erp 
			,SUM(ISNULL(a.f_sum_budget_erp,0)) AS f_sum_budget_erp 
			,SUM(ISNULL(a.f_sum_budget_erp1,0)) AS f_sum_budget_erp1


			,SUM(ISNULL(a.f_total_rev,0)) AS f_total_rev 
			,SUM(ISNULL(a.f_total_pr_type1,0)) AS f_total_pr_type1 
			,SUM(ISNULL(a.f_total_pr_type2,0)) AS f_total_pr_type2

		FROM #tempData a
			LEFT JOIN #temp_vw_bg_expense_with_parent b ON a.bg_expense_id = b.bg_expense_lv4_id OR a.bg_expense_id = b.bg_expense_lv2_id
		GROUP BY b.bg_expense_lv1_id, b.c_code_lv1, b.c_name_lv1
		UNION ALL
		SELECT
			b.bg_expense_lv2_id AS bg_expense_id
			,2 AS i_level
			,b.c_code_lv2 AS c_code
			,b.c_name_lv2 AS c_name
			,SUM(ISNULL(a.f_budget,0)) AS f_budget  /*(A1)*/
			,SUM(ISNULL(a.f_budget_adjust,0)) AS f_budget_adjust /*(A2)*/
			--,SUM(ISNULL(a.f_budget_long,0)) AS f_budget_long  /*(BL1)*/
			--,SUM(ISNULL(a.f_reserve_budget_long,0)) AS f_reserve_budget_long  /*(BL2)*/
			,SUM(ISNULL(a.f_reserve_budget,0)) AS f_reserve_budget /*(A3)*/
			,SUM(ISNULL(a.f_reserve_budget_income,0)) AS f_reserve_budget_income /*(A4)*/
			,SUM(ISNULL(a.f_reserve_budget_income_Finish,0)) AS f_reserve_budget_income_Finish  /*(A5)*/

			,SUM(ISNULL(a.f_budget_period,0)) AS f_budget_period  /*(B1)*/
			,SUM(ISNULL(a.f_budgetadjust_period,0)) AS f_budgetadjust_period /*(B2)*/
			,SUM(ISNULL(a.f_reserve_period,0)) AS f_reserve_period /*(B3)*/
			,SUM(ISNULL(a.f_reserve_periodincome,0)) AS f_reserve_periodincome /*(B4)*/
			,SUM(ISNULL(a.f_reserve_periodfinish,0)) AS f_reserve_periodfinish  /*(B5)*/

			,SUM(ISNULL(a.f_budget_income,0)) AS f_budget_income /*(C1)*/
			--,(select top 1 sum(f_total) from #tempBudgetIncome qq where qq.bg_expense_lv4_id = b.bg_expense_lv4_id) AS f_budget_income /*(C1)*/
			,SUM(ISNULL(a.f_income_transfer,0)) AS f_income_transfer /*(C2)*/
			,SUM(ISNULL(a.f_reserve_income,0)) AS f_reserve_income /*(C3)*/
			,SUM(ISNULL(a.f_reserve_income_Finish,0)) AS f_reserve_income_Finish /*(C4)*/
			
			,SUM(ISNULL(a.f_working_cost0,0)) AS f_working_cost0 /**/
			,SUM(ISNULL(a.f_return_cost0,0)) AS f_return_cost0 /**/
			,SUM(ISNULL(a.f_working_cost1,0)) AS f_working_cost1 /**/
			,SUM(ISNULL(a.f_return_cost1,0)) AS f_return_cost1 /**/
			,SUM(ISNULL(a.f_working_cost2,0)) AS f_working_cost2 /**/
			,SUM(ISNULL(a.f_return_cost2,0)) AS f_return_cost2 /**/

			,SUM(ISNULL(a.f_working0,0)) AS f_working0 /*(D1)*/
			,SUM(ISNULL(a.f_return0,0)) AS f_return0 /*(E1)*/
			,SUM(ISNULL(a.f_working1,0)) AS f_working1 /*(D2)*/
			,SUM(ISNULL(a.f_return1,0)) AS f_return1 /*(E2)*/
			,SUM(ISNULL(a.f_working2,0)) AS f_working2 /*(D3)*/
			,SUM(ISNULL(a.f_return2,0)) AS f_return2 /*(E3)*/

			,SUM(ISNULL(a.f_sum_work_budget0,0)) AS f_sum_work_budget0 
			,SUM(ISNULL(a.f_sum_work_budget1,0)) AS f_sum_work_budget1 
			,SUM(ISNULL(a.f_sum_budget0,0)) AS f_sum_budget0 
			--,SUM(ISNULL(a.f_sum_budget_no_long0,0)) AS f_sum_budget_no_long0 
			,SUM(ISNULL(a.f_sum_budget1,0)) AS f_sum_budget1 
			,SUM(ISNULL(a.f_sum_budget2,0)) AS f_sum_budget2 

			,SUM(ISNULL(a.f_sum_work_budget_period0,0)) AS f_sum_work_budget_period0 
			,SUM(ISNULL(a.f_sum_work_budget_period1,0)) AS f_sum_work_budget_period1 
			,SUM(ISNULL(a.f_sum_budget_period0,0)) AS f_sum_budget_period0 
			,SUM(ISNULL(a.f_sum_budget_period1,0)) AS f_sum_budget_period1 
			,SUM(ISNULL(a.f_sum_budget_period2,0)) AS f_sum_budget_period2 

			,SUM(ISNULL(a.f_sum_work_budget_income0,0)) AS f_sum_work_budget_income0 
			,SUM(ISNULL(a.f_sum_work_budget_income1,0)) AS f_sum_work_budget_income1 
			,SUM(ISNULL(a.f_sum_budget_income0,0)) AS f_sum_budget_income0 
			,SUM(ISNULL(a.f_sum_budget_income1,0)) AS f_sum_budget_income1 
			,SUM(ISNULL(a.f_sum_budget_income2,0)) AS f_sum_budget_income2 

			,SUM(ISNULL(a.f_total_erp,0)) AS f_total_erp 
			,SUM(ISNULL(a.f_sum_budget_erp,0)) AS f_sum_budget_erp 
			,SUM(ISNULL(a.f_sum_budget_erp1,0)) AS f_sum_budget_erp1

			,SUM(ISNULL(a.f_total_rev,0)) AS f_total_rev 
			,SUM(ISNULL(a.f_total_pr_type1,0)) AS f_total_pr_type1 
			,SUM(ISNULL(a.f_total_pr_type2,0)) AS f_total_pr_type2

		FROM #tempData a
			LEFT JOIN #temp_vw_bg_expense_with_parent b ON a.bg_expense_id = b.bg_expense_lv4_id OR a.bg_expense_id = b.bg_expense_lv2_id
		GROUP BY b.bg_expense_lv2_id, b.c_code_lv2, b.c_name_lv2 
		UNION ALL
		SELECT
			b.bg_expense_lv3_id AS bg_expense_id
			,3 AS i_level
			,b.c_code_lv3 AS c_code
			,b.c_name_lv3 AS c_name
			,SUM(ISNULL(a.f_budget,0)) AS f_budget  /*(A1)*/
			,SUM(ISNULL(a.f_budget_adjust,0)) AS f_budget_adjust /*(A2)*/
			--,SUM(ISNULL(a.f_budget_long,0)) AS f_budget_long  /*(BL1)*/
			--,SUM(ISNULL(a.f_reserve_budget_long,0)) AS f_reserve_budget_long  /*(BL2)*/
			,SUM(ISNULL(a.f_reserve_budget,0)) AS f_reserve_budget /*(A3)*/
			,SUM(ISNULL(a.f_reserve_budget_income,0)) AS f_reserve_budget_income /*(A4)*/
			,SUM(ISNULL(a.f_reserve_budget_income_Finish,0)) AS f_reserve_budget_income_Finish  /*(A5)*/

			,SUM(ISNULL(a.f_budget_period,0)) AS f_budget_period  /*(B1)*/
			,SUM(ISNULL(a.f_budgetadjust_period,0)) AS f_budgetadjust_period /*(B2)*/
			,SUM(ISNULL(a.f_reserve_period,0)) AS f_reserve_period /*(B3)*/
			,SUM(ISNULL(a.f_reserve_periodincome,0)) AS f_reserve_periodincome /*(B4)*/
			,SUM(ISNULL(a.f_reserve_periodfinish,0)) AS f_reserve_periodfinish  /*(B5)*/

			,SUM(ISNULL(a.f_budget_income,0)) AS f_budget_income /*(C1)*/
			--,0 AS f_budget_income /*(C1)*/
			,SUM(ISNULL(a.f_income_transfer,0)) AS f_income_transfer /*(C2)*/
			,SUM(ISNULL(a.f_reserve_income,0)) AS f_reserve_income /*(C3)*/
			,SUM(ISNULL(a.f_reserve_income_Finish,0)) AS f_reserve_income_Finish /*(C4)*/

			,SUM(ISNULL(a.f_working_cost0,0)) AS f_working_cost0 /**/
			,SUM(ISNULL(a.f_return_cost0,0)) AS f_return_cost0 /**/
			,SUM(ISNULL(a.f_working_cost1,0)) AS f_working_cost1 /**/
			,SUM(ISNULL(a.f_return_cost1,0)) AS f_return_cost1 /**/
			,SUM(ISNULL(a.f_working_cost2,0)) AS f_working_cost2 /**/
			,SUM(ISNULL(a.f_return_cost2,0)) AS f_return_cost2 /**/

			,SUM(ISNULL(a.f_working0,0)) AS f_working0 /*(D1)*/
			,SUM(ISNULL(a.f_return0,0)) AS f_return0 /*(E1)*/
			,SUM(ISNULL(a.f_working1,0)) AS f_working1 /*(D2)*/
			,SUM(ISNULL(a.f_return1,0)) AS f_return1 /*(E2)*/
			,SUM(ISNULL(a.f_working2,0)) AS f_working2 /*(D3)*/
			,SUM(ISNULL(a.f_return2,0)) AS f_return2 /*(E3)*/

			,SUM(ISNULL(a.f_sum_work_budget0,0)) AS f_sum_work_budget0 
			,SUM(ISNULL(a.f_sum_work_budget1,0)) AS f_sum_work_budget1 
			,SUM(ISNULL(a.f_sum_budget0,0)) AS f_sum_budget0 
			--,SUM(ISNULL(a.f_sum_budget_no_long0,0)) AS f_sum_budget_no_long0 
			,SUM(ISNULL(a.f_sum_budget1,0)) AS f_sum_budget1 
			,SUM(ISNULL(a.f_sum_budget2,0)) AS f_sum_budget2 

			,SUM(ISNULL(a.f_sum_work_budget_period0,0)) AS f_sum_work_budget_period0 
			,SUM(ISNULL(a.f_sum_work_budget_period1,0)) AS f_sum_work_budget_period1 
			,SUM(ISNULL(a.f_sum_budget_period0,0)) AS f_sum_budget_period0 
			,SUM(ISNULL(a.f_sum_budget_period1,0)) AS f_sum_budget_period1 
			,SUM(ISNULL(a.f_sum_budget_period2,0)) AS f_sum_budget_period2 

			,SUM(ISNULL(a.f_sum_work_budget_income0,0)) AS f_sum_work_budget_income0 
			,SUM(ISNULL(a.f_sum_work_budget_income1,0)) AS f_sum_work_budget_income1 
			,SUM(ISNULL(a.f_sum_budget_income0,0)) AS f_sum_budget_income0 
			,SUM(ISNULL(a.f_sum_budget_income1,0)) AS f_sum_budget_income1 
			,SUM(ISNULL(a.f_sum_budget_income2,0)) AS f_sum_budget_income2 

			,SUM(ISNULL(a.f_total_erp,0)) AS f_total_erp 
			,SUM(ISNULL(a.f_sum_budget_erp,0)) AS f_sum_budget_erp 
			,SUM(ISNULL(a.f_sum_budget_erp1,0)) AS f_sum_budget_erp1 

			,SUM(ISNULL(a.f_total_rev,0)) AS f_total_rev 
			,SUM(ISNULL(a.f_total_pr_type1,0)) AS f_total_pr_type1 
			,SUM(ISNULL(a.f_total_pr_type2,0)) AS f_total_pr_type2
			
		FROM #tempData a
			LEFT JOIN #temp_vw_bg_expense_with_parent b ON a.bg_expense_id = b.bg_expense_lv4_id OR a.bg_expense_id = b.bg_expense_lv2_id
		GROUP BY b.bg_expense_lv3_id, b.c_code_lv3, b.c_name_lv3
		UNION ALL
		SELECT
			b.bg_expense_lv4_id AS bg_expense_id
			,4 AS i_level
			,b.c_code_lv4 AS c_code
			,b.c_name_lv4 AS c_name

			,SUM(ISNULL(a.f_budget,0)) AS f_budget  /*(A1)*/
			,SUM(ISNULL(a.f_budget_adjust,0)) AS f_budget_adjust /*(A2)*/
			--,SUM(ISNULL(a.f_budget_long,0)) AS f_budget_long  /*(BL1)*/
			--,SUM(ISNULL(a.f_reserve_budget_long,0)) AS f_reserve_budget_long  /*(BL2)*/
			,SUM(ISNULL(a.f_reserve_budget,0)) AS f_reserve_budget /*(A3)*/
			,SUM(ISNULL(a.f_reserve_budget_income,0)) AS f_reserve_budget_income /*(A4)*/
			,SUM(ISNULL(a.f_reserve_budget_income_Finish,0)) AS f_reserve_budget_income_Finish  /*(A5)*/
			
			,SUM(ISNULL(a.f_budget_period,0)) AS f_budget_period  /*(B1)*/
			,SUM(ISNULL(a.f_budgetadjust_period,0)) AS f_budgetadjust_period /*(B2)*/
			,SUM(ISNULL(a.f_reserve_period,0)) AS f_reserve_period /*(B3)*/
			,SUM(ISNULL(a.f_reserve_periodincome,0)) AS f_reserve_periodincome /*(B4)*/
			,SUM(ISNULL(a.f_reserve_periodfinish,0)) AS f_reserve_periodfinish  /*(B5)*/

			,SUM(ISNULL(a.f_budget_income,0)) AS f_budget_income /*(C1)*/
			--,0 AS f_budget_income /*(C1)*/
			,SUM(ISNULL(a.f_income_transfer,0)) AS f_income_transfer /*(C2)*/
			,SUM(ISNULL(a.f_reserve_income,0)) AS f_reserve_income /*(C3)*/
			,SUM(ISNULL(a.f_reserve_income_Finish,0)) AS f_reserve_income_Finish /*(C4)*/

			,SUM(ISNULL(a.f_working_cost0,0)) AS f_working_cost0 /**/
			,SUM(ISNULL(a.f_return_cost0,0)) AS f_return_cost0 /**/
			,SUM(ISNULL(a.f_working_cost1,0)) AS f_working_cost1 /**/
			,SUM(ISNULL(a.f_return_cost1,0)) AS f_return_cost1 /**/
			,SUM(ISNULL(a.f_working_cost2,0)) AS f_working_cost2 /**/
			,SUM(ISNULL(a.f_return_cost2,0)) AS f_return_cost2 /**/

			,SUM(ISNULL(a.f_working0,0)) AS f_working0 /*(D1)*/
			,SUM(ISNULL(a.f_return0,0)) AS f_return0 /*(E1)*/
			,SUM(ISNULL(a.f_working1,0)) AS f_working1 /*(D2)*/
			,SUM(ISNULL(a.f_return1,0)) AS f_return1 /*(E2)*/
			,SUM(ISNULL(a.f_working2,0)) AS f_working2 /*(D3)*/
			,SUM(ISNULL(a.f_return2,0)) AS f_return2 /*(E3)*/
			
			,SUM(ISNULL(a.f_sum_work_budget0,0)) AS f_sum_work_budget0 
			,SUM(ISNULL(a.f_sum_work_budget1,0)) AS f_sum_work_budget1 
			,SUM(ISNULL(a.f_sum_budget0,0)) AS f_sum_budget0 
			--,SUM(ISNULL(a.f_sum_budget_no_long0,0)) AS f_sum_budget_no_long0 
			,SUM(ISNULL(a.f_sum_budget1,0)) AS f_sum_budget1 
			,SUM(ISNULL(a.f_sum_budget2,0)) AS f_sum_budget2 

			,SUM(ISNULL(a.f_sum_work_budget_period0,0)) AS f_sum_work_budget_period0 
			,SUM(ISNULL(a.f_sum_work_budget_period1,0)) AS f_sum_work_budget_period1 
			,SUM(ISNULL(a.f_sum_budget_period0,0)) AS f_sum_budget_period0 
			,SUM(ISNULL(a.f_sum_budget_period1,0)) AS f_sum_budget_period1 
			,SUM(ISNULL(a.f_sum_budget_period2,0)) AS f_sum_budget_period2 

			,SUM(ISNULL(a.f_sum_work_budget_income0,0)) AS f_sum_work_budget_income0 
			,SUM(ISNULL(a.f_sum_work_budget_income1,0)) AS f_sum_work_budget_income1 
			,SUM(ISNULL(a.f_sum_budget_income0,0)) AS f_sum_budget_income0 
			,SUM(ISNULL(a.f_sum_budget_income1,0)) AS f_sum_budget_income1 
			,SUM(ISNULL(a.f_sum_budget_income2,0)) AS f_sum_budget_income2 
			
			,SUM(ISNULL(a.f_total_erp,0)) AS f_total_erp 
			,SUM(ISNULL(a.f_sum_budget_erp,0)) AS f_sum_budget_erp 
			,SUM(ISNULL(a.f_sum_budget_erp1,0)) AS f_sum_budget_erp1 

			,SUM(ISNULL(a.f_total_rev,0)) AS f_total_rev 
			,SUM(ISNULL(a.f_total_pr_type1,0)) AS f_total_pr_type1 
			,SUM(ISNULL(a.f_total_pr_type2,0)) AS f_total_pr_type2


			--,(SUM(ISNULL(a.f_reserve_budget,0)) + SUM(ISNULL(a.f_reserve_budget_income,0)) + (SUM(ISNULL(a.f_working0,0))-SUM(ISNULL(a.f_return0,0)))) - (SUM(ISNULL(a.f_working1,0)) - SUM(ISNULL(a.f_return1,0))) as f_sum_work_budget0 /*(A3 + A4 + (D1 - E1)) - (D2 - E2)*/
			--,(SUM(ISNULL(a.f_reserve_budget,0)) + SUM(ISNULL(a.f_reserve_budget_income,0)) + (SUM(ISNULL(a.f_working0,0))-SUM(ISNULL(a.f_return0,0)))) - (SUM(ISNULL(a.f_working2,0)) - SUM(ISNULL(a.f_return2,0))) as f_sum_work_budget1 /*(A3 + A4 + (D1 - E1)) - (D3 - E3)*/
			--,(SUM(ISNULL(a.f_budget,0))+SUM(ISNULL(a.f_budget_adjust,0))) - (SUM(ISNULL(a.f_reserve_budget,0))+SUM(ISNULL(a.f_reserve_budget_income,0))) - (SUM(ISNULL(a.f_working0,0)) - SUM(ISNULL(a.f_return0,0)))as f_sum_budget0 /*(A1 + A2) - (A3 + A4) - (D1 - E1)*/
			--,(SUM(ISNULL(a.f_budget,0))+SUM(ISNULL(a.f_budget_adjust,0))) - (SUM(ISNULL(a.f_working1,0)) - SUM(ISNULL(a.f_return1,0)))as f_sum_budget1 /*(A1 + A2) - (D2 - E2)*/
			--,(SUM(ISNULL(a.f_budget,0))+SUM(ISNULL(a.f_budget_adjust,0))) - (SUM(ISNULL(a.f_working2,0)) - SUM(ISNULL(a.f_return2,0)))as f_sum_budget2 /*(A1 + A2) - (D3 - E3)*/

			--,CASE WHEN SUM(ISNULL(a.f_budget_period,0)) > 0 THEN (SUM(ISNULL(a.f_reserve_period,0)) + (SUM(ISNULL(a.f_working0,0))-SUM(ISNULL(a.f_return0,0)))) - (SUM(ISNULL(a.f_working1,0)) - SUM(ISNULL(a.f_return1,0))) ELSE 0 END AS f_sum_work_budget_period0 /*(B3 + (D1 - E1)) - (D2 - E2)*/
			--,CASE WHEN SUM(ISNULL(a.f_budget_period,0)) > 0 THEN (SUM(ISNULL(a.f_reserve_period,0)) + (SUM(ISNULL(a.f_working0,0))-SUM(ISNULL(a.f_return0,0)))) - (SUM(ISNULL(a.f_working2,0)) - SUM(ISNULL(a.f_return2,0))) ELSE 0 END AS f_sum_work_budget_period1 /* (B3 + (D1 - E1)) - (D3 - E3)*/
			--,CASE WHEN SUM(ISNULL(a.f_budget_period,0)) > 0 THEN (SUM(ISNULL(a.f_budget_period,0))+SUM(ISNULL(a.f_budget_adjust,0))) - (SUM(ISNULL(a.f_reserve_period,0)) + SUM(ISNULL(a.f_reserve_periodincome,0))) - (SUM(ISNULL(a.f_working0,0)) - SUM(ISNULL(a.f_return0,0))) ELSE 0 END AS f_sum_budget_period0 /*(B1 + B2) - (B3 + B4) - (D1 - E1)*/
			--,CASE WHEN SUM(ISNULL(a.f_budget_period,0)) > 0 THEN (SUM(ISNULL(a.f_budget,0))+SUM(ISNULL(a.f_budget_adjust,0))) - (SUM(ISNULL(a.f_working1,0)) - SUM(ISNULL(a.f_return1,0))) ELSE 0 END AS f_sum_budget_period1 /*(B1 + B2) - (D2 - E2)*/
			--,CASE WHEN SUM(ISNULL(a.f_budget_period,0)) > 0 THEN (SUM(ISNULL(a.f_budget,0))+SUM(ISNULL(a.f_budget_adjust,0))) - (SUM(ISNULL(a.f_working2,0)) - SUM(ISNULL(a.f_return2,0))) ELSE 0 END AS f_sum_budget_period2 /*(B1 + B2) - (D3 - E3)*/

			--,(SUM(ISNULL(a.f_budget_income,0)) + (SUM(ISNULL(a.f_working0,0))-SUM(ISNULL(a.f_return0,0)))) - (SUM(ISNULL(a.f_working1,0)) - SUM(ISNULL(a.f_return1,0))) as f_sum_work_budget_income0 /*(C3 + (D1 - E1)) - (D2 - E2)*/
			--,(SUM(ISNULL(a.f_budget_income,0)) + (SUM(ISNULL(a.f_working0,0))-SUM(ISNULL(a.f_return0,0)))) - (SUM(ISNULL(a.f_working2,0)) - SUM(ISNULL(a.f_return2,0))) as f_sum_work_budget_income1 /*(C3 + (D1 - E1)) - (D3 - E3)*/
			--,(SUM(ISNULL(a.f_budget_income,0)) + SUM(ISNULL(a.f_income_transfer,0))) - (SUM(ISNULL(a.f_reserve_income,0))) - (SUM(ISNULL(a.f_working0,0)) - SUM(ISNULL(a.f_return0,0)))as f_sum_budget_income0 /*(C1 + C2) - (C3) - (D1 - E1)*/
			--,(SUM(ISNULL(a.f_budget_income,0)) + SUM(ISNULL(a.f_income_transfer,0))) - (SUM(ISNULL(a.f_working1,0)) - SUM(ISNULL(a.f_return1,0)))as f_sum_budget_income1 /*(C1 + C2) - (D2 - E2)*/
			--,(SUM(ISNULL(a.f_budget_income,0)) + SUM(ISNULL(a.f_income_transfer,0))) - (SUM(ISNULL(a.f_working2,0)) - SUM(ISNULL(a.f_return2,0)))as f_sum_budget_income2 /*(C1 + C2) - (D3 - E3)*/
		FROM #tempData a
			LEFT JOIN #temp_vw_bg_expense_with_parent b ON a.bg_expense_id = b.bg_expense_lv4_id OR a.bg_expense_id = b.bg_expense_lv2_id
		GROUP BY b.bg_expense_lv4_id, b.c_code_lv4, b.c_name_lv4
		ORDER BY c_code;

				
		DROP TABLE #tempBudget,#tempBudgetAdjust,#tempBudgetIncome,#tempBudgetTransfer,#tempData,#tempDiscount,#tempExtra,#tempIncomeTransfer,#tempWorking0,#tempWorking1,#tempWorking2,#tempBudget_period,#tempBudgetAdjust_period,#tempDiscount_period,#tempExtra_period,#tempReserve,#tempBudgetAdjust_income,#tempDiscount_income,#tempExtra_income,#tempBudget_period_bg,#tempBudget_sum_reserve1
		,#tempBudget_sum_pr_type1,#tempBudget_sum_pr_type2,#temp_vw_bg_expense_with_parent
		";
				// echo($sqlMain); 
				// exit();
	if ($_REQUEST["type"] == "show_sql") {
		/******echo sql******/
		$sql = $sqlMain;
		$arr = array();

		$sql = str_replace('?', '#-#', $sql);
		foreach ($arr as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
		/********************/
	}

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {
		$no = 0;

		$f_budget                          	= 0;
		$f_budget_adjust                   	= 0;
		$f_budget_total                    	= 0;
		// $f_budget_long                    	= 0;
		// $f_reserve_budget_long              = 0;
		$f_reserve_budget                  	= 0;
		$f_reserve_budget_income           	= 0;
		$f_reserve_budget_income_Finish    	= 0;
		$f_budget_period         			= 0;
		$f_budgetadjust_period   			= 0;
		$f_budget_period_total  			= 0;
		$f_reserve_period        			= 0;
		$f_reserve_periodincome  			= 0;
		$f_reserve_periodfinish  			= 0;
		$f_budget_income                   	= 0;
		$f_income_transfer                 	= 0;
		$f_budget_income_total             	= 0;
		$f_reserve_income                  	= 0;
		$f_reserve_income_finish           	= 0;

		$f_working_cost0                   	= 0;
		$f_return_cost0                    	= 0;
		$f_working_cost1                   	= 0;
		$f_return_cost1                    	= 0;
		$f_working_cost2                   	= 0;
		$f_return_cost2                    	= 0;

		$f_working0                        	= 0;
		$f_return0                         	= 0;
		$f_working1                        	= 0;
		$f_return1                         	= 0;
		$f_working2                        	= 0;
		$f_return2                         	= 0;
		$f_sum_work_budget0					= 0;
		$f_sum_work_budget1					= 0;
		$f_sum_budget0						= 0;
		// $f_sum_budget_no_long0				= 0;
		$f_sum_budget1						= 0;
		$f_sum_budget2						= 0;
		$f_sum_work_budget_period0			= 0;
		$f_sum_work_budget_period1			= 0;
		$f_sum_budget_period0				= 0;
		$f_sum_budget_period1				= 0;
		$f_sum_budget_period2				= 0;
		$f_sum_work_budget_income0			= 0;
		$f_sum_work_budget_income1			= 0;
		$f_sum_budget_income0				= 0;
		$f_sum_budget_income1				= 0;
		$f_sum_budget_income2				= 0;

		$f_total_erp 						= 0; 
		$f_sum_budget_erp 					= 0; 
		$f_sum_budget_erp1 					= 0; 

		$f_total_rev 						= 0; 
		$f_total_pr_type1 					= 0; 
		$f_total_pr_type2 					= 0; 

			

		while ($row = $db->Fetch($stmt)) {
			if ($row["i_level"] == 1) {
				$no++;

				$f_budget                          	+=	$row["f_budget"]; /*A1*/
				$f_budget_adjust                   	+=	$row["f_budget_adjust"]; /*A2*/
				$f_budget_total                    	+=  $row["f_budget"] + $row["f_budget_adjust"];
				// $f_budget_long                   	+=	$row["f_budget_long"]; /*BL1*/
				// $f_reserve_budget_long              +=	$row["f_reserve_budget_long"]; /*BL2*/
				$f_reserve_budget                  	+=	$row["f_reserve_budget"]; /*A3*/
				$f_reserve_budget_income           	+=	$row["f_reserve_budget_income"]; /*A4*/
				$f_reserve_budget_income_Finish    	+=	$row["f_reserve_budget_income_Finish"]; /*A5*/
				$f_budget_period         			+=	$row["f_budget_period"]; /*B1*/
				$f_budgetadjust_period   			+=	$row["f_budgetadjust_period"]; /*B2*/
				$f_budget_period_total  			+=  $row["f_budget_period"] + $row["f_budgetadjust_period"];
				$f_reserve_period        			+=	$row["f_reserve_period"]; /*B3*/
				$f_reserve_periodincome  			+=	$row["f_reserve_periodincome"]; /*B4*/
				$f_reserve_periodfinish  			+=	$row["f_reserve_periodfinish"]; /*B5*/
				$f_budget_income                   	+=	$row["f_budget_income"]; /*C1*/
				$f_income_transfer                 	+=	$row["f_income_transfer"];  /*C2*/
				$f_budget_income_total             	+=  $row["f_budget_income"] + $row["f_income_transfer"];
				$f_reserve_income                  	+=	$row["f_reserve_income"];  /*C3*/
				$f_reserve_income_finish           	+=	$row["f_reserve_income_Finish"]; /*C4*/
				$f_working_cost0                    +=	$row["f_working_cost0"]; /**/
				$f_return_cost0                     +=	$row["f_return_cost0"]; /**/
				$f_working_cost1                    +=	$row["f_working_cost1"]; /*D2*/
				$f_return_cost1                     +=	$row["f_return_cost1"]; /*E2*/
				$f_working_cost2                    +=	$row["f_working_cost2"]; /*D3*/
				$f_return_cost2                     +=	$row["f_return_cost2"]; /*E2*/
				$f_working0                        	+=	$row["f_working0"]; /*D1*/
				$f_return0                         	+=	$row["f_return0"]; /*E1*/
				$f_working1                        	+=	$row["f_working1"]; /*D2*/
				$f_return1                         	+=	$row["f_return1"]; /*E2*/
				$f_working2                        	+=	$row["f_working2"]; /*D3*/
				$f_return2                         	+=	$row["f_return2"]; /*E2*/
				$f_sum_work_budget0					+=	$row["f_sum_work_budget0"];
				$f_sum_work_budget1					+=	$row["f_sum_work_budget1"];
				// $f_sum_budget_no_long0				+=	$row["f_sum_budget_no_long0"];
				$f_sum_budget0						+=	$row["f_sum_budget0"];
				$f_sum_budget1						+=	$row["f_sum_budget1"];
				$f_sum_budget2						+=	$row["f_sum_budget2"];
				$f_sum_work_budget_period0			+=	$row["f_sum_work_budget_period0"];
				$f_sum_work_budget_period1			+=	$row["f_sum_work_budget_period1"];
				$f_sum_budget_period0				+=	$row["f_sum_budget_period0"];
				$f_sum_budget_period1				+=	$row["f_sum_budget_period1"];
				$f_sum_budget_period2				+=	$row["f_sum_budget_period2"];
				$f_sum_work_budget_income0			+=	$row["f_sum_work_budget_income0"];
				$f_sum_work_budget_income1			+=	$row["f_sum_work_budget_income1"];
				$f_sum_budget_income0				+=	$row["f_sum_budget_income0"];
				$f_sum_budget_income1				+=	$row["f_sum_budget_income1"];
				$f_sum_budget_income2				+=	$row["f_sum_budget_income2"];

				$f_total_erp						+=	$row["f_total_erp"];
				$f_sum_budget_erp					+=	$row["f_sum_budget_erp"];
				$f_sum_budget_erp1				+=	$row["f_sum_budget_erp1"];

				$f_total_rev						+=	$row["f_total_rev"];
				$f_total_pr_type1					+=	$row["f_total_pr_type1"];
				$f_total_pr_type2					+=	$row["f_total_pr_type2"];

			}

			if (
				($row["i_level"] == 1 && $_REQUEST["i_level1"] == 1)
				|| ($row["i_level"] == 2 && $_REQUEST["i_level2"] == 1)
				|| ($row["i_level"] == 3 && $_REQUEST["i_level3"] == 1)
				|| ($row["i_level"] == 4 && $_REQUEST["i_level4"] == 1)
			) {
				$temp = array(
					"no"                                => $no,
					"i_type"                            => 1,
					"bg_expense_id"                     =>	$row["bg_expense_id"],
					"i_level"                           =>	$row["i_level"],
					"c_code"                            =>	$row["c_code"],
					"c_name"                            =>	$row["c_name"],

					"f_budget"                          =>	$row["f_budget"], /*A1*/
					"f_budget_adjust"                   =>	$row["f_budget_adjust"], /*A2*/
					"f_budget_total"                    =>  $row["f_budget"] + $row["f_budget_adjust"],
					//"f_budget_long"                   	=>	$row["f_budget_long"], /*BL1*/
					//"f_reserve_budget_long"             =>	$row["f_reserve_budget_long"], /*BL2*/
					"f_reserve_budget"                  =>	$row["f_reserve_budget"], /*A3*/
					"f_reserve_budget_income"           =>	$row["f_reserve_budget_income"], /*A4*/
					"f_reserve_budget_income_Finish"    =>	$row["f_reserve_budget_income_Finish"], /*A5*/

					"f_budget_period"         			=>	$row["f_budget_period"], /*B1*/
					"f_budgetadjust_period"   			=>	$row["f_budgetadjust_period"], /*B2*/
					"f_budget_period_total"   			=>  $row["f_budget_period"] + $row["f_budgetadjust_period"],
					"f_reserve_period"        			=>	$row["f_reserve_period"], /*B3*/
					"f_reserve_periodincome"  			=>	$row["f_reserve_periodincome"], /*B4*/
					"f_reserve_periodfinish"  			=>	$row["f_reserve_periodfinish"], /*B5*/


					"f_budget_income"                   =>	$row["f_budget_income"], /*C1*/
					"f_income_transfer"                 =>	$row["f_income_transfer"],  /*C2*/
					"f_budget_income_total"             =>  $row["f_budget_income"] + $row["f_income_transfer"],
					"f_reserve_income"                  =>	$row["f_reserve_income"],  /*C3*/
					"f_reserve_income_finish"           =>	$row["f_reserve_income_Finish"], /*C4*/

					"f_working_cost0"                   =>	$row["f_working_cost0"], /**/
					"f_return_cost0"                    =>	$row["f_return_cost0"], /**/
					"f_working_cost1"                   =>	$row["f_working_cost1"], /**/
					"f_return_cost1"                    =>	$row["f_return_cost1"], /**/
					"f_working_cost2"                   =>	$row["f_working_cost2"], /**/
					"f_return_cost2"                    =>	$row["f_return_cost2"], /**/

					"f_working0"                        =>	$row["f_working0"], /*D1*/
					"f_return0"                         =>	$row["f_return0"], /*E1*/
					"f_working1"                        =>	$row["f_working1"], /*D2*/
					"f_return1"                         =>	$row["f_return1"], /*E2*/
					"f_working2"                        =>	$row["f_working2"], /*D3*/
					"f_return2"                         =>	$row["f_return2"], /*E2*/

					"f_sum_work_budget0"				=>	$row["f_sum_work_budget0"],
					"f_sum_work_budget1"				=>	$row["f_sum_work_budget1"],
					"f_sum_budget0"						=>	$row["f_sum_budget0"],
					//"f_sum_budget_no_long0"				=>	$row["f_sum_budget_no_long0"],
					"f_sum_budget1"						=>	$row["f_sum_budget1"],
					"f_sum_budget2"						=>	$row["f_sum_budget2"],
					"f_sum_work_budget_period0"			=>	$row["f_sum_work_budget_period0"],
					"f_sum_work_budget_period1"			=>	$row["f_sum_work_budget_period1"],
					"f_sum_budget_period0"				=>	$row["f_sum_budget_period0"],
					"f_sum_budget_period1"				=>	$row["f_sum_budget_period1"],
					"f_sum_budget_period2"				=>	$row["f_sum_budget_period2"],
					"f_sum_work_budget_income0"			=>	$row["f_sum_work_budget_income0"],
					"f_sum_work_budget_income1"			=>	$row["f_sum_work_budget_income1"],
					"f_sum_budget_income0"				=>	$row["f_sum_budget_income0"],
					"f_sum_budget_income1"				=>	$row["f_sum_budget_income1"],
					"f_sum_budget_income2"				=>	$row["f_sum_budget_income2"],

					"f_total_erp"						=>	$row["f_total_erp"],
					"f_sum_budget_erp"					=>	$row["f_sum_budget_erp"],
					"f_sum_budget_erp1"					=>	$row["f_sum_budget_erp1"],

					"f_total_rev"						=>	$row["f_total_rev"],
					"f_total_pr_type1"					=>	$row["f_total_pr_type1"],
					"f_total_pr_type2"					=>	$row["f_total_pr_type2"],

				);
				${$root}[]	= $temp;
			}
		}
		$temp = array(
			"no"                                => $no,
			"i_type"                            => 2,
			"c_name"                            => "รวมทั้งสิ้น",
			"f_budget"                          =>	$f_budget, /*A1*/
			"f_budget_adjust"                   =>	$f_budget_adjust, /*A2*/
			// "f_budget_long"                     =>	$f_budget_long, /*BL1*/
			// "f_reserve_budget_long"             =>	$f_reserve_budget_long, /*BL2*/
			"f_budget_total"                    =>  $f_budget,
			"f_reserve_budget"                  =>	$f_reserve_budget, /*A3*/
			"f_reserve_budget_income"           =>	$f_reserve_budget_income, /*A4*/
			"f_reserve_budget_income_Finish"    =>	$f_reserve_budget_income_Finish, /*A5*/
			"f_budget_period"                   =>	$f_budget_period, /*B1*/
			"f_budgetadjust_period"             =>	$f_budgetadjust_period, /*B2*/
			"f_budget_period_total"             =>  $f_budget_period_total,
			"f_reserve_period"                  =>	$f_reserve_period, /*B3*/
			"f_reserve_periodincome"            =>	$f_reserve_periodincome, /*B4*/
			"f_reserve_periodfinish"            =>	$f_reserve_periodfinish, /*B5*/
			"f_budget_income"                   =>	$f_budget_income, /*C1*/
			"f_income_transfer"                 =>	$f_income_transfer,  /*C2*/
			"f_budget_income_total"             =>  $f_budget_income,
			"f_reserve_income"                  =>	$f_reserve_income,  /*C3*/
			"f_reserve_income_finish"           =>	$f_reserve_income_finish, /*C4*/

			"f_working_cost0"                  	=>	$f_working_cost0, /**/
			"f_return_cost0"                   	=>	$f_return_cost0, /**/
			"f_working_cost1"                  	=>	$f_working_cost1, /**/
			"f_return_cost1"                   	=>	$f_return_cost1, /**/
			"f_working_cost2"                  	=>	$f_working_cost2, /**/
			"f_return_cost2"                   	=>	$f_return_cost2, /**/

			"f_working0"                        =>	$f_working0, /*D1*/
			"f_return0"                         =>	$f_return0, /*E1*/
			"f_working1"                        =>	$f_working1, /*D2*/
			"f_return1"                         =>	$f_return1, /*E2*/
			"f_working2"                        =>	$f_working2, /*D3*/
			"f_return2"                         =>	$f_return2, /*E2*/
			"f_sum_work_budget0"                =>	$f_sum_work_budget0,
			"f_sum_work_budget1"                =>	$f_sum_work_budget1,
			"f_sum_budget0"                     =>	$f_sum_budget0,
			// "f_sum_budget_no_long0"             =>	$f_sum_budget_no_long0,
			"f_sum_budget1"                     =>	$f_sum_budget1,
			"f_sum_budget2"                     =>	$f_sum_budget2,
			"f_sum_work_budget_period0"         =>	$f_sum_work_budget_period0,
			"f_sum_work_budget_period1"         =>	$f_sum_work_budget_period1,
			"f_sum_budget_period0"              =>	$f_sum_budget_period0,
			"f_sum_budget_period1"              =>	$f_sum_budget_period1,
			"f_sum_budget_period2"              =>	$f_sum_budget_period2,
			"f_sum_work_budget_income0"         =>	$f_sum_work_budget_income0,
			"f_sum_work_budget_income1"         =>	$f_sum_work_budget_income1,
			"f_sum_budget_income0"              =>	$f_sum_budget_income0,
			"f_sum_budget_income1"              =>	$f_sum_budget_income1,
			"f_sum_budget_income2"              =>	$f_sum_budget_income2,

			"f_total_erp"              			=>	$f_total_erp,
			"f_sum_budget_erp"              	=>	$f_sum_budget_erp,
			"f_sum_budget_erp1"              	=>	$f_sum_budget_erp1,

			"f_total_rev"              			=>	$f_total_rev,
			"f_total_pr_type1"              	=>	$f_total_pr_type1,
			"f_total_pr_type2"              	=>	$f_total_pr_type2,

		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
