<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/export/ArrayToXlsx.php");


$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;
$con1 = null;
$con2 = null;
$con3 = null;
$budget = null ;

// exit;
function List_QueryParam()
{
	// print_r($_SESSION[$dc_cost_id]);
	// exit;
	$DBNAMENMU =  "NMU..";
	$DBNAMEERP =  "NMU_ERP..";

	global $db, $date, $root, $data, $con, $arr_status,$con1,$con2,$con3;
	$DB_NAME = '';
	$Income_Lv = $_REQUEST["i_year"] < 2022 ? '2' : '4';
	if($_SESSION['i_level'] == 3 ){
		$dc_cost_id = ' AND aa.dc_cost_id = '. $_SESSION['dc_cost_id'];
		$dc_cost_id2 = ' AND bb.dc_cost_id = '. $_SESSION['dc_cost_id'];
		$cost3 = ($_REQUEST["dc_cost_id"] > 0) ? " AND CASE WHEN ISNULL(bb.dc_cost_ref_id,0) = 0 THEN bb.dc_cost_id ELSE bb.dc_cost_ref_id END = {$_REQUEST["dc_cost_id"]}" : "";

		// echo($dc_cost_id);
		// exit;
	} else {
		$dc_cost_id = ' AND aa.dc_cost_id = '. $_REQUEST['dc_cost_id'];
		$dc_cost_id2 = ' AND bb.dc_cost_id = '. $_REQUEST['dc_cost_id'];
		$cost3 = ($_REQUEST["dc_cost_id"] > 0) ? " AND CASE WHEN ISNULL(bb.dc_cost_ref_id,0) = 0 THEN bb.dc_cost_id ELSE bb.dc_cost_ref_id END = {$_REQUEST["dc_cost_id"]}" : "";

	}
	$full_join2  = null;
	$full_join3  = null;
	$column2  = null;
	$column3  = null;
	$column2_sum  = null;
	$column3_sum  = null;
	$sql2  = null;
	$sql3  = null;
		$for_id_budget = explode(";", $_REQUEST["dc_expense_budget_type_id"]);
		if (!in_array("0", $for_id_budget)) {
			$in = "";
			if (is_array($for_id_budget)) {
				foreach ($for_id_budget as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$budget = ($in != "") ? " AND aa.dc_expense_budget_type_id IN (" . $in . ")" : "";
				// $con_1 = ($in != "") ? " AND cc.bg_expense_lv{$Income_Lv}_id IN (SELECT a.bg_expense_lv{$Income_Lv}_id FROM {$DBNAMENMU} vw_bg_expense_with_parent a WHERE a.bg_expense_lv4_id IN (" . $in . "))" : "";
			}
		}
	$cost2 = null ; 
	$dc_expense_budget_type_name1 = explode(";",$_REQUEST["dc_expense_budget_type_id"])[0]; 
	$dc_expense_budget_type_name2 = explode(";",$_REQUEST["dc_expense_budget_type_id"])[1]??null; 
	$dc_expense_budget_type_name3 = explode(";",$_REQUEST["dc_expense_budget_type_id"])[2]??null; 

	$budget1a = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND aa.dc_expense_budget_type_id = {$dc_expense_budget_type_name1}" : "";
	$budget22 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND bb.dc_expense_budget_type_id =  {$dc_expense_budget_type_name1}" : "";

	$expense_budget_type_name1 = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = {$dc_expense_budget_type_name1}",array($dc_expense_budget_type_name1 ));
	if($dc_expense_budget_type_name2 != null){
		$budget2 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND aa.dc_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";
		$expense_budget_type_name2 = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = {$dc_expense_budget_type_name2}",array($dc_expense_budget_type_name2 ));
		$sql = '';
		$budget2a = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND aa.dc_expense_budget_type_id = {$dc_expense_budget_type_name2}" : "";
		$sql2 = "
		-------------------------------------------------------------- กทม ----------------------------------------------------------------------------------------------------------
		/* เงินประจำงวด */
		SELECT cc.bg_expense_lv4_id, SUM(ISNULL(f_total,0)) AS f_total
				INTO #tempBudget_period
				FROM (
					SELECT
						bb.bg_expense_id_lv4 AS bg_expense_lv4_id
						,bb.bg_budget_dtl_id
						,cc.bg_expense_lv1_id 
						,ISNULL(bb.f_total, 0) AS f_total
					FROM NMU.. bg_budget_hdr aa
						INNER JOIN NMU.. bg_budget_dtl bb ON aa.bg_budget_hdr_id = bb.bg_budget_hdr_id
						INNER JOIN NMU.. vw_bg_expense_with_parent cc ON bb.bg_expense_id_lv4 = cc.bg_expense_lv4_id
					WHERE aa.i_enable = 1 
						AND aa.i_year = @i_year
						--AND bb.f_total > 0
						AND cc.bg_expense_lv4_id IN (52)  
						AND aa.dc_expense_budget_type_id = 2  
						--AND cc.bg_expense_lv4_id IN (52)  
						{$budget2a}
						{$dc_cost_id2}
					GROUP BY bb.bg_expense_id_lv4, cc.bg_expense_lv1_id, f_total ,bb.bg_budget_dtl_id
				)cc
				WHERE 1=1 
				GROUP BY cc.bg_expense_lv4_id;
		SELECT 
					aa.bg_expense_id
					-- /*เงินจอง แผน*/
					,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 1  {$dc_cost_id}  THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_pr
					,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 2  {$dc_cost_id}  THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_contract
					--,SUM(CASE WHEN cc.c_code_lv1 = '100000000' THEN (CASE WHEN i_pr_type = 1 AND i_reserve != 3 THEN ISNULL(f_amt,0) ELSE 0 end) ELSE 0 END) AS f_reserve_budget_long
					,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 3 AND ISNULL(i_finish,0) = 0  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_income
					,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 3 AND ISNULL(i_finish,0) = 1  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_income_Finish
		
					/*เงินจอง งวด*/
					,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 1  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_period
					,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 2  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_period_contrect
					,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 3 AND ISNULL(i_finish,0) = 0  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_periodincome
					,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 3 AND ISNULL(i_finish,0) = 1  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_periodfinish
		
					/*เงินจอง รับจริง*/
					,SUM(CASE WHEN i_reserve = 3 AND ISNULL(i_finish,0) = 0  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_income
					,SUM(CASE WHEN i_reserve = 3 AND ISNULL(i_finish,0) = 1  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_income_Finish
				INTO #tempAllexpense2
				FROM NMU.. vw_bg_reserve_money aa
				INNER JOIN NMU.. vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
				WHERE aa.i_year = 2024
						AND aa.f_amt > 0
					{$budget2a}	
					--AND aa.dc_expense_budget_type_id = 4
					{$dc_cost_id}
					--AND aa.dc_cost_id = 38
				GROUP BY 
					i_year
					,bg_expense_id
					,dc_expense_budget_type_id
		
		/* โอนเปลี่ยนแปลง */
				SELECT
					bb.bg_expense_id
					,SUM(ISNULL(bb.f_change, 0)) AS f_total_D
					INTO #tempDiscount_bangkok
				FROM nmu..bg_budget_hdr_change aa
					INNER JOIN nmu..bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id and ISNULL(bb.i_extenal,0) != 1
					INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
				WHERE aa.i_enable = 1 
					AND aa.i_year = 2024 
					AND i_type = 1
					--AND aa.dc_expense_budget_type_id = 4
					{$budget2a}
					{$dc_cost_id2}
					--AND bb.dc_cost_id =  38
				GROUP BY bb.bg_expense_id ;
		
		SELECT
					bb.bg_expense_id
					,SUM(ISNULL(bb.f_change, 0)) AS f_total_E
					INTO #tempExtra_bangkok
				FROM  nmu..bg_budget_hdr_change aa
					INNER JOIN nmu..bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id and ISNULL(bb.i_extenal,0) != 1
					INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
				WHERE aa.i_enable = 1 
					AND aa.i_year = 2024  
					AND i_type = 2	
					--AND aa.dc_expense_budget_type_id = 4
					{$budget2a}
					--and bb.dc_cost_id = 38 
					{$dc_cost_id2}
				GROUP BY bb.bg_expense_id
		select CASE
						WHEN ISNULL(a.bg_expense_id,0) > 0 THEN a.bg_expense_id
						WHEN ISNULL(b.bg_expense_id,0) > 0 THEN b.bg_expense_id
						WHEN ISNULL(b.bg_expense_id,0) = 0 and ISNULL(a.bg_expense_id,0) = 0  THEN 0
					END AS bg_expense_id,
					ISNULL(f_total_E, 0) - ISNULL(f_total_D, 0) AS f_total			
				INTO #tempBudgetAdjust_bangkok
				FROM #tempExtra_bangkok a 
				FULL JOIN #tempDiscount_bangkok b on ISNULL(a.bg_expense_id,0) = ISNULL(b.bg_expense_id,0)
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
				INTO #tempBudgetTransfer_bangkok
				FROM (
					SELECT
						bb.bg_expense_begin_id AS bg_expense_id
						,-SUM(ISNULL(bb.f_total, 0)) AS f_total
					FROM nmu..bg_budget_hdr_transfer aa
						INNER JOIN nmu..bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
						INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_begin_id = cc.bg_expense_lv4_id
					WHERE aa.i_enable = 1 AND aa.i_transfer = 1
						AND aa.i_year = @i_year
						AND bb.f_total > 0
					--AND aa.dc_expense_budget_type_id = 4
					{$budget2a}
					GROUP BY bb.bg_expense_begin_id 
					UNION ALL
					SELECT
						bb.bg_expense_end_id AS bg_expense_id
						,SUM(ISNULL(bb.f_total, 0)) AS f_total
					FROM nmu..bg_budget_hdr_transfer aa
						INNER JOIN nmu..bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
						INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_end_id = cc.bg_expense_lv4_id
					WHERE aa.i_enable = 1 AND aa.i_transfer = 1
						AND aa.i_year = @i_year
						AND bb.f_total > 0
					--AND aa.dc_expense_budget_type_id = 4
					{$budget2a}
					GROUP BY bb.bg_expense_end_id 
				) z;
			/* งบประมาณตามบัญชีจัดสรร */
			SELECT
				bb.bg_expense_id
				,cc.bg_expense_lv2_id
				,SUM(ISNULL(bb.f_total, 0)) AS f_total
			INTO #tempBudget_bangkok
			FROM NMU..bg_budget_hdr_plan aa
				INNER JOIN NMU..bg_budget_dtl_plan bb ON aa.bg_budget_hdr_plan_id = bb.bg_budget_hdr_plan_id
				INNER JOIN NMU..vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1
				AND aa.i_year = @i_year
				AND bb.f_total > 0 
				{$budget2a}
				--AND aa.dc_expense_budget_type_id = 4
				{$dc_cost_id2}
				--AND bb.dc_cost_id = 38
				GROUP BY bb.bg_expense_id, bg_expense_lv2_id
		-------------------------------------------------------------- แหล่งที่ 2 ----------------------------------------------------------------------------------------------------------
		";
		$full_join2 = "
		FULL JOIN #tempBudget_bangkok ab ON ab.bg_expense_id = a.bg_expense_id 
		FULL JOIN #tempBudget_period b ON ab.bg_expense_id = b.bg_expense_lv4_id 
		FULL JOIN #tempBudgetAdjust_bangkok bb ON ab.bg_expense_id = bb.bg_expense_id  
		FULL JOIN #tempBudgetTransfer_bangkok bbb ON ab.bg_expense_id = bbb.bg_expense_id  
		FULL JOIN #tempAllexpense2 bbbb ON ab.bg_expense_id = bbbb.bg_expense_id  ";
		$column2 = ",SUM(ISNULL(a.f_budget_bangkok,0)) AS f_budget_bangkok  
		,SUM(ISNULL(a.f_budget_bangkok_reserve,0)) AS f_budget_bangkok_reserve  
		,SUM(ISNULL(a.f_reserve_period_contrect,0)) AS f_reserve_period_contrect  
		,SUM(ISNULL(a.f_reserve_budget_income_bangkok,0)) AS f_reserve_budget_income_bangkok  
		,SUM(ISNULL(a.f_budget_bangkok_reserve_contract,0)) AS f_budget_bangkok_reserve_contract   
		,SUM(ISNULL(a.f_budget_bangkok_withdrawing,0)) AS f_budget_bangkok_withdrawing 
		,SUM(ISNULL(a.f_budget_bangkok_withdraw,0)) AS f_budget_bangkok_withdraw   
		,SUM(ISNULL(a.f_sum_budget_period0,0)) AS f_sum_budget_period0   
		,SUM(ISNULL(a.f_budget_bangkok_remaining,0)) AS f_budget_bangkok_remaining   ";
		$column2_sum = "
		,(isnull(ab.f_total,0) )  + (ISNULL(bb.f_total,0) + ISNULL(bbb.f_total,0))   AS f_budget_bangkok
		, case when isnull(bbbb.f_reserve_budget_contract,0) -  isnull(bbbb.f_reserve_income_Finish,0)  <= 0
		then 0	else isnull(bbbb.f_reserve_budget_contract,0) -  isnull(bbbb.f_reserve_income_Finish,0) end  
		as f_budget_bangkok_withdrawing
		,CASE WHEN ISNULL(bbbb.f_reserve_periodincome,0) = 0 
		THEN bbbb.f_reserve_budget_income ELSE bbbb.f_reserve_periodincome + bbbb.f_reserve_budget_income END AS f_reserve_budget_income_bangkok
		
		,bb.f_total as f_budgetadjust_period 
        ,bbbb.f_reserve_periodincome as  f_reserve_periodincome
		,bbbb.f_reserve_period as f_budget_bangkok_reserve
		,bbbb.f_reserve_budget_contract as f_budget_bangkok_reserve_contract
		,bbbb.f_reserve_period_contrect as f_reserve_period_contrect
		,ab.f_total as f_budget_period

		,bbbb.f_reserve_income_Finish as f_budget_bangkok_withdraw 
		,(isnull(ab.f_total,0) )  + (ISNULL(bb.f_total,0) + ISNULL(bbb.f_total,0)) - (isnull(bbbb.f_reserve_period,0)+ isnull(bbbb.f_reserve_period_contrect,0) + isnull(bbbb.f_reserve_budget_contract,0)+ 
		ISNULL(bbbb.f_reserve_periodincome,0) + isnull(bbbb.f_reserve_income_Finish,0) ) as  f_budget_bangkok_remaining
		";
	}  
	if($dc_expense_budget_type_name3 != null){
		$expense_budget_type_name3 = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = {$dc_expense_budget_type_name3}",array($dc_expense_budget_type_name3 ));
		$budget3 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND aa.dc_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";
		$budget3a = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND aa.dc_expense_budget_type_id = {$dc_expense_budget_type_name3}" : "";
		$sql3 = "
		-------------------------------------------------------------- รัฐบาล ----------------------------------------------------------------------------------------------------------
		/* เงินประจำงวด */
		SELECT cc.bg_expense_lv4_id, SUM(ISNULL(f_total,0)) AS f_total
				INTO #tempBudget_period3
				FROM (
					SELECT
						bb.bg_expense_id_lv4 AS bg_expense_lv4_id
						,bb.bg_budget_dtl_id
						,cc.bg_expense_lv1_id 
						,ISNULL(bb.f_total, 0) AS f_total
					FROM NMU.. bg_budget_hdr aa
						INNER JOIN NMU.. bg_budget_dtl bb ON aa.bg_budget_hdr_id = bb.bg_budget_hdr_id
						INNER JOIN NMU.. vw_bg_expense_with_parent cc ON bb.bg_expense_id_lv4 = cc.bg_expense_lv4_id
					WHERE aa.i_enable = 1 
						AND aa.i_year = @i_year
						--AND bb.f_total > 0
						--AND cc.bg_expense_lv4_id IN (52)  
						{$budget3a}
						{$dc_cost_id2}
					GROUP BY bb.bg_expense_id_lv4, cc.bg_expense_lv1_id, f_total ,bb.bg_budget_dtl_id
				)cc
				WHERE 1=1 
				GROUP BY cc.bg_expense_lv4_id;
		SELECT 
					aa.bg_expense_id
					-- /*เงินจอง แผน*/
					,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 1  {$dc_cost_id}  THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_pr
					,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 2  {$dc_cost_id}  THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_contract
					--,SUM(CASE WHEN cc.c_code_lv1 = '100000000' THEN (CASE WHEN i_pr_type = 1 AND i_reserve != 3 THEN ISNULL(f_amt,0) ELSE 0 end) ELSE 0 END) AS f_reserve_budget_long
					,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 3 AND ISNULL(i_finish,0) = 0  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_income
					,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 3 AND ISNULL(i_finish,0) = 1  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_income_Finish
		
					/*เงินจอง งวด*/
					,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 1  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_period
					,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 2  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_period_contrect
					,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 3 AND ISNULL(i_finish,0) = 0  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_periodincome
					,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 3 AND ISNULL(i_finish,0) = 1  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_periodfinish
		
					/*เงินจอง รับจริง*/
					,SUM(CASE WHEN i_reserve = 3 AND ISNULL(i_finish,0) = 0  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_income
					,SUM(CASE WHEN i_reserve = 3 AND ISNULL(i_finish,0) = 1  {$dc_cost_id} THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_income_Finish
				INTO #tempAllexpense3
				FROM NMU.. vw_bg_reserve_money aa
				INNER JOIN NMU.. vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
				WHERE aa.i_year = 2024
						AND aa.f_amt > 0
					--AND aa.dc_expense_budget_type_id = 5
					{$budget3a}
					{$dc_cost_id}
					--AND aa.dc_cost_id = 38
				GROUP BY 
					i_year
					,bg_expense_id
					,dc_expense_budget_type_id
		
		/* โอนเปลี่ยนแปลง */
				SELECT
					bb.bg_expense_id
					,SUM(ISNULL(bb.f_change, 0)) AS f_total_D
					INTO #tempDiscount_government
				FROM nmu..bg_budget_hdr_change aa
					INNER JOIN nmu..bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id and ISNULL(bb.i_extenal,0) != 1
					INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
				WHERE aa.i_enable = 1 
					AND aa.i_year = 2024 
					AND i_type = 1
					--AND aa.dc_expense_budget_type_id = 5
					{$budget3a}
					{$dc_cost_id2}
					--AND bb.dc_cost_id =  38
				GROUP BY bb.bg_expense_id 
		SELECT
					bb.bg_expense_id
					,SUM(ISNULL(bb.f_change, 0)) AS f_total_E
					INTO #tempExtra_government
				FROM  nmu..bg_budget_hdr_change aa
					INNER JOIN nmu..bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id and ISNULL(bb.i_extenal,0) != 1
					INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
				WHERE aa.i_enable = 1 
					AND aa.i_year = 2024  
					AND i_type = 2	
					--AND aa.dc_expense_budget_type_id = 5
					{$budget3a}
					--and bb.dc_cost_id = 38 
					{$dc_cost_id2}
				GROUP BY bb.bg_expense_id
		select CASE
						WHEN ISNULL(a.bg_expense_id,0) > 0 THEN a.bg_expense_id
						WHEN ISNULL(b.bg_expense_id,0) > 0 THEN b.bg_expense_id
						WHEN ISNULL(b.bg_expense_id,0) = 0 and ISNULL(a.bg_expense_id,0) = 0  THEN 0
					END AS bg_expense_id,
					ISNULL(f_total_E, 0) - ISNULL(f_total_D, 0) AS f_total			
				INTO #tempBudgetAdjust_government
				FROM #tempExtra_government a 
				FULL JOIN #tempDiscount_bangkok b on ISNULL(a.bg_expense_id,0) = ISNULL(b.bg_expense_id,0)
				WHERE
					CASE
						WHEN ISNULL(a.bg_expense_id,0) > 0 THEN a.bg_expense_id
						WHEN ISNULL(b.bg_expense_id,0) > 0 THEN b.bg_expense_id
						WHEN ISNULL(b.bg_expense_id,0) = 0 and ISNULL(a.bg_expense_id,0) = 0  THEN 0
					END > 0
					AND ISNULL(f_total_E, 0) - ISNULL(f_total_D, 0) != 0;
					-- AND 
		/* โอนเปลี่ยนแปลงภายในส่วนงาน (บัญชีจัดสรร) */
				SELECT
					*
				INTO #tempBudgetTransfer_government
				FROM (
					SELECT
						bb.bg_expense_begin_id AS bg_expense_id
						,-SUM(ISNULL(bb.f_total, 0)) AS f_total
					FROM nmu..bg_budget_hdr_transfer aa
						INNER JOIN nmu..bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
						INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_begin_id = cc.bg_expense_lv4_id
					WHERE aa.i_enable = 1 AND aa.i_transfer = 1
						AND aa.i_year = @i_year
						AND bb.f_total > 0
					--AND aa.dc_expense_budget_type_id = 5
					{$budget3a}
					GROUP BY bb.bg_expense_begin_id 
					UNION ALL
					SELECT
						bb.bg_expense_end_id AS bg_expense_id
						,SUM(ISNULL(bb.f_total, 0)) AS f_total
					FROM nmu..bg_budget_hdr_transfer aa
						INNER JOIN nmu..bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
						INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_end_id = cc.bg_expense_lv4_id
					WHERE aa.i_enable = 1 AND aa.i_transfer = 1
						AND aa.i_year = @i_year
						AND bb.f_total > 0
					--AND aa.dc_expense_budget_type_id = 5
					{$budget3a}
					GROUP BY bb.bg_expense_end_id 
				) z;
			/* งบประมาณตามบัญชีจัดสรร */
			SELECT
				bb.bg_expense_id
				,cc.bg_expense_lv2_id
				,SUM(ISNULL(bb.f_total, 0)) AS f_total
			INTO #tempBudget_government
			FROM NMU..bg_budget_hdr_plan aa
				INNER JOIN NMU..bg_budget_dtl_plan bb ON aa.bg_budget_hdr_plan_id = bb.bg_budget_hdr_plan_id
				INNER JOIN NMU..vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1
				AND aa.i_year = @i_year
				AND bb.f_total > 0 
				{$budget3a}
				--AND aa.dc_expense_budget_type_id = 5
				--AND bb.dc_cost_id = 38
				{$dc_cost_id2}
				GROUP BY bb.bg_expense_id, bg_expense_lv2_id 
		-------------------------------------------------------------- รัฐบาล ----------------------------------------------------------------------------------------------------------
		" ;
		$full_join3 = "
		FULL JOIN #tempBudget_government ac ON ac.bg_expense_id = a.bg_expense_id 
		FULL JOIN #tempBudget_period3 c ON ac.bg_expense_id = c.bg_expense_lv4_id 
		FULL JOIN #tempBudgetAdjust_government cc ON ac.bg_expense_id = cc.bg_expense_id  
		FULL JOIN #tempBudgetTransfer_government ccc ON ac.bg_expense_id = ccc.bg_expense_id  
		FULL JOIN #tempAllexpense3 cccc ON ac.bg_expense_id = cccc.bg_expense_id  ";
		$column3 = "		
		,SUM(ISNULL(a.f_budget_government,0)) AS f_budget_government  /*(A1)*/
		,SUM(ISNULL(a.f_budget_government_reserve,0)) AS f_budget_government_reserve  /*(A1)*/
		,SUM(ISNULL(a.f_reserve_budget_income_government,0)) AS f_reserve_budget_income_government  /*(A1)*/
		,SUM(ISNULL(a.f_budget_government_reserve_contract,0)) AS f_budget_government_reserve_contract  /*(A1)*/
		,SUM(ISNULL(a.f_budget_government_withdrawing,0)) AS f_budget_government_withdrawing  /*(A1)*/
		,SUM(ISNULL(a.f_budget_government_withdraw,0)) AS f_budget_government_withdraw  /*(A1)*/
		,SUM(ISNULL(a.f_budget_government_remaining,0)) AS f_budget_government_remaining  /*(A1)*/

		";
		$column3_sum = "
		,(isnull(ac.f_total,0) )  + (ISNULL(cc.f_total,0) + ISNULL(ccc.f_total,0))   AS f_budget_government
		, case when isnull(cccc.f_reserve_budget_contract,0) -  isnull(cccc.f_reserve_budget_income_Finish,0)  <= 0
		then 0	else isnull(cccc.f_reserve_budget_contract,0) -  isnull(cccc.f_reserve_budget_income_Finish,0) end  
		as f_budget_government_withdrawing
		,CASE WHEN ISNULL(cccc.f_reserve_periodincome,0) = 0 
		THEN cccc.f_reserve_budget_income ELSE cccc.f_reserve_periodincome + cccc.f_reserve_budget_income END AS f_reserve_budget_income_government
		
		,cccc.f_reserve_budget_income_Finish as f_budget_government_withdraw 
		,cccc.f_reserve_period as f_budget_government_reserve
		,cccc.f_reserve_budget_contract as f_budget_government_reserve_contract
		
		,ac.f_total as f_budget_period_government
		
		,(isnull(ac.f_total,0) )  + (ISNULL(cc.f_total,0) + ISNULL(ccc.f_total,0))  - (isnull(cccc.f_reserve_period,0)  +  isnull(cccc.f_reserve_period_contrect,0) + isnull(bbbb.f_reserve_budget_contract,0)+ 
		ISNULL(cccc.f_reserve_periodincome,0) + isnull(cccc.f_reserve_income_Finish,0) )as  f_budget_government_remaining 
		";
	}
	$sqlMain = "SET NOCOUNT ON
		DECLARE @i_year AS numeric = 2024;
		--- ตั้ง 
		/* งบประมาณตามบัญชีจัดสรร */
		SELECT
			bb.bg_expense_id
			,cc.bg_expense_lv2_id
			,SUM(ISNULL(bb.f_total, 0)) AS f_total
		INTO #tempBudget_set
		FROM NMU..bg_budget_hdr_plan aa
			INNER JOIN NMU..bg_budget_dtl_plan bb ON aa.bg_budget_hdr_plan_id = bb.bg_budget_hdr_plan_id
			INNER JOIN NMU..vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1
			AND aa.i_year = @i_year
			AND bb.f_total > 0 
			--AND aa.dc_expense_budget_type_id in(2,4,5) 
			{$budget}   
			{$dc_cost_id2}
			--AND bb.dc_cost_id = 38
			GROUP BY bb.bg_expense_id, bg_expense_lv2_id
		-------------------------------------------------------------- รายได้ bg_expense_id ตัวหลัก ----------------------------------------------------------------------------------------------------------
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
		FROM {$DBNAMENMU} po_working_hdr aa
			INNER JOIN {$DBNAMENMU} po_working_dtl bb ON aa.po_working_hdr_id = bb.po_working_hdr_id
				AND bb.bg_expense_id IS NOT NULL
			INNER JOIN {$DBNAMENMU} vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
			LEFT JOIN (SELECT po_working_hdr_id ,SUM(isnull(f_return,0)) AS f_return FROM {$DBNAMENMU} po_return WHERE i_enable = 1 GROUP BY po_working_hdr_id) ret ON aa.po_working_hdr_id = ret.po_working_hdr_id
		WHERE aa.i_enable = 1
			AND bb.i_budget_year_overlap = @i_year
			AND bb.f_total > 0
			{$budget22} 
			{$cost3}
		GROUP BY bb.bg_expense_id;
		SELECT 
				aa.bg_expense_id
				-- /*เงินจอง แผน*/
				,SUM(CASE WHEN i_pr_type = 1 AND i_reserve  = 1   AND aa.dc_cost_id = 38  THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_pr
				,SUM(CASE WHEN i_pr_type = 1 AND i_reserve  = 2   AND aa.dc_cost_id = 38  THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_contract
				--,SUM(CASE WHEN cc.c_code_lv1 = '100000000' THEN (CASE WHEN i_pr_type = 1 AND i_reserve != 3 THEN ISNULL(f_amt,0) ELSE 0 end) ELSE 0 END) AS f_reserve_budget_long
				,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 3 AND ISNULL(i_finish,0) = 0  AND aa.dc_cost_id = 38 THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_income
				,SUM(CASE WHEN i_pr_type = 1 AND i_reserve = 3 AND ISNULL(i_finish,0) = 1  AND aa.dc_cost_id = 38 THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_budget_income_Finish
	
				/*เงินจอง งวด*/
				,SUM(CASE WHEN i_pr_type = 2 AND i_reserve != 3  AND aa.dc_cost_id = 38 THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_period
				,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 3 AND ISNULL(i_finish,0) = 0  AND aa.dc_cost_id = 38 THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_periodincome
				,SUM(CASE WHEN i_pr_type = 2 AND i_reserve = 3 AND ISNULL(i_finish,0) = 1  AND aa.dc_cost_id = 38 THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_periodfinish
	
				/*เงินจอง รับจริง*/
				,SUM(CASE WHEN i_reserve = 3 AND ISNULL(i_finish,0) = 0  AND aa.dc_cost_id = 38 THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_income
				,SUM(CASE WHEN i_reserve = 3 AND ISNULL(i_finish,0) = 1  AND aa.dc_cost_id = 38 THEN ISNULL(f_amt,0) ELSE 0 end) AS f_reserve_income_Finish
			INTO #tempAllexpense1
			FROM NMU.. vw_bg_reserve_money aa
			INNER JOIN NMU.. vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
			WHERE aa.i_year = 2024
					AND aa.f_amt > 0
				  	--AND aa.dc_expense_budget_type_id = 2
					{$budget1a}
					{$dc_cost_id}
					--AND aa.dc_cost_id = 38
			GROUP BY 
				i_year
				,bg_expense_id
				,dc_expense_budget_type_id
	/* โอนเปลี่ยนแปลง */
			SELECT
				bb.bg_expense_id
				,SUM(ISNULL(bb.f_change, 0)) AS f_total_D
				INTO #tempDiscount
			FROM nmu..bg_budget_hdr_change aa
				INNER JOIN nmu..bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id and ISNULL(bb.i_extenal,0) != 1
				INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1 
				AND aa.i_year = 2024 
				AND i_type = 1
				{$budget1a}
				--AND aa.dc_expense_budget_type_id = 2
				{$dc_cost_id2}
				--AND bb.dc_cost_id =  38
			GROUP BY bb.bg_expense_id 
	
	SELECT
				bb.bg_expense_id
				,SUM(ISNULL(bb.f_change, 0)) AS f_total_E
				INTO #tempExtra
			FROM  nmu..bg_budget_hdr_change aa
				INNER JOIN nmu..bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id and ISNULL(bb.i_extenal,0) != 1
				INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1 
				AND aa.i_year = 2024  
				AND i_type = 2	
				{$budget1a}
				--AND aa.dc_expense_budget_type_id = 2
				{$dc_cost_id2}
				--and bb.dc_cost_id = 38 
			GROUP BY bb.bg_expense_id

	select CASE
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
				AND ISNULL(f_total_E, 0) - ISNULL(f_total_D, 0) != 0
				;
	/* โอนเปลี่ยนแปลงภายในส่วนงาน (บัญชีจัดสรร) */
			SELECT
				*
			INTO #tempBudgetTransfer
			FROM (
				SELECT
					bb.bg_expense_begin_id AS bg_expense_id
					,-SUM(ISNULL(bb.f_total, 0)) AS f_total
				FROM nmu..bg_budget_hdr_transfer aa
					INNER JOIN nmu..bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
					INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_begin_id = cc.bg_expense_lv4_id
				WHERE aa.i_enable = 1 AND aa.i_transfer = 1
					AND aa.i_year = @i_year
					AND bb.f_total > 0
				--AND aa.dc_expense_budget_type_id = 2
				{$budget1a}
				GROUP BY bb.bg_expense_begin_id 
				UNION ALL
				SELECT
					bb.bg_expense_end_id AS bg_expense_id
					,SUM(ISNULL(bb.f_total, 0)) AS f_total
				FROM nmu..bg_budget_hdr_transfer aa
					INNER JOIN nmu..bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
					INNER JOIN nmu..vw_bg_expense_with_parent cc ON bb.bg_expense_end_id = cc.bg_expense_lv4_id
				WHERE aa.i_enable = 1 AND aa.i_transfer = 1
					AND aa.i_year = @i_year
					AND bb.f_total > 0
					{$budget1a}
				--AND aa.dc_expense_budget_type_id = 2
				GROUP BY bb.bg_expense_end_id 
			) z;
		/* งบประมาณตามบัญชีจัดสรร */
		SELECT
			bb.bg_expense_id
			,cc.bg_expense_lv2_id
			,SUM(ISNULL(bb.f_total, 0)) AS f_total
		INTO #tempBudget
		FROM NMU..bg_budget_hdr_plan aa
			INNER JOIN NMU..bg_budget_dtl_plan bb ON aa.bg_budget_hdr_plan_id = bb.bg_budget_hdr_plan_id
			INNER JOIN NMU..vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1
			AND aa.i_year = @i_year
			AND bb.f_total > 0 
			{$budget1a}
			--AND aa.dc_expense_budget_type_id = 2
			--AND bb.dc_cost_id = 38
			{$dc_cost_id2}
			GROUP BY bb.bg_expense_id, bg_expense_lv2_id;
	-------------------------------------------------------------- รายได้ ----------------------------------------------------------------------------------------------------------
	{$sql2}
	{$sql3}
		/* รวมข้อมูล */
		SELECT 
		CASE WHEN ISNULL(a.f_budget_period,0) != 0 THEN (ISNULL(a.f_budget_period,0)+ISNULL(a.f_budgetadjust_period,0)) - (ISNULL(a.f_budget_bangkok_reserve,0) + ISNULL(a.f_budget_bangkok_reserve_contract,0) + 
		ISNULL(a.f_reserve_periodincome,0)) - (ISNULL(a.f_budget_bangkok_withdraw,0) ) ELSE 0 END AS f_sum_budget_period0 /*(B1 + B2) - (B3 + B4) - (D1 - E1)*/
		,* 

		INTO #tempData
		FROM (
		SELECT
			CASE
			WHEN a.bg_expense_id IS NOT NULL THEN a.bg_expense_id
			END AS bg_expense_id
            -- , a.dc_expense_budget_type_id  as  dc_expense_budget_type_id
			,(isnull(aa.f_total,0) )  + (ISNULL(aaa.f_total,0) + ISNULL(aaaa.f_total,0))   AS f_budget_income

			,aaaaa.f_reserve_budget_pr as f_budget_income_reserve
			,aaaaa.f_reserve_budget_contract as f_budget_income_reserve_contract
			, case when isnull(aaaaa.f_reserve_budget_contract,0) -  isnull(aaaaa.f_reserve_budget_income_Finish,0)  <= 0
			then 0	else isnull(aaaaa.f_reserve_budget_contract,0) -  isnull(aaaaa.f_reserve_budget_income_Finish,0) end  
			as f_budget_income_withdrawing
			,CASE WHEN ISNULL(aaaaa.f_reserve_periodincome,0) = 0 THEN aaaaa.f_reserve_budget_income ELSE aaaaa.f_reserve_periodincome + aaaaa.f_reserve_budget_income END AS f_reserve_budget_income

			,aaaaa.f_reserve_budget_income_Finish as f_budget_income_withdraw

		,(isnull(aa.f_total,0) )  + (ISNULL(aaa.f_total,0)) - 
		((isnull(aaaaa.f_reserve_budget_pr,0) + isnull(aaaaa.f_reserve_budget_contract,0) + isnull(aaaaa.f_reserve_budget_income_Finish,0) + (ISNULL(aaaaa.f_reserve_budget_income,0) 
		+ isnull(aaaaa.f_reserve_income_Finish,0) ) ) - (ISNULL(a0.f_total,0) - ISNULL(a0.f_return,0))  ) as  f_budget_income_remaining


			{$column2_sum}

			{$column3_sum}
			
		FROM #tempBudget_set a
		FULL JOIN #tempBudget aa ON a.bg_expense_id = aa.bg_expense_id  
		FULL JOIN #tempWorking0 a0 ON aa.bg_expense_id = a0.bg_expense_id  
		FULL JOIN #tempBudgetAdjust aaa ON a.bg_expense_id = aaa.bg_expense_id  
		FULL JOIN #tempBudgetTransfer aaaa ON a.bg_expense_id = aaaa.bg_expense_id  
		FULL JOIN #tempAllexpense1 aaaaa ON a.bg_expense_id = aaaaa.bg_expense_id  
		
		{$full_join2}

		{$full_join3}
	) a

	SELECT
		b.bg_expense_lv4_id AS bg_expense_id
		,4 AS i_level
		,b.c_code_lv4 AS c_code
		,b.c_name_lv4 AS c_name
        -- ,a.dc_expense_budget_type_id

		,SUM(ISNULL(a.f_budget_income,0)) AS f_budget_income  /*(A1)*/
		,SUM(ISNULL(a.f_budget_income_reserve,0)) AS f_budget_income_reserve  /*(A1)*/
		,SUM(ISNULL(a.f_budget_income_reserve_contract,0)) AS f_budget_income_reserve_contract  /*(A1)*/
		,SUM(ISNULL(a.f_budget_income_withdrawing,0)) AS f_budget_income_withdrawing  /*(A1)*/
		,SUM(ISNULL(a.f_budget_income_withdraw,0)) AS f_budget_income_withdraw  /*(A1)*/
		,SUM(ISNULL(a.f_reserve_budget_income,0)) AS f_reserve_budget_income  /*(A1)*/
		,SUM(ISNULL(a.f_budget_income_remaining,0)) AS f_budget_income_remaining  /*(A1)*/

		{$column2}

		{$column3}
		
		FROM #tempData a
			LEFT JOIN NMU.. vw_bg_expense_with_parent b ON a.bg_expense_id = b.bg_expense_lv4_id -- OR a.bg_expense_id = b.bg_expense_lv2_id
		GROUP BY b.bg_expense_lv4_id, b.c_code_lv4, b.c_name_lv4 
		ORDER BY c_code;
	
	
		
	
	";
	// DROP TABLE #tempBudget 
	// 	,#tempBudget_set
	// 	,#tempDiscount
	// 	,#tempData 
	
	// 	,#tempExtra
	// 	,#tempBudgetAdjust
	// 	,#tempBudgetTransfer
	// 	,#tempAllexpense1
	
	
	// 	,#tempBudget_bangkok
	// 	,#tempDiscount_bangkok
	// 	,#tempAllexpense2
	
	// 	,#tempExtra_bangkok
	// 	,#tempBudgetAdjust_bangkok
	// 	,#tempBudgetTransfer_bangkok
	
	// 	,#tempAllexpense3
	// 	,#tempDiscount_government
	// 	,#tempExtra_government
	// 	,#tempBudgetAdjust_government
	// 	,#tempBudgetTransfer_government
	// 	,#tempBudget_government
	
	// $arrParam[]	= $_REQUEST['i_year'] - 1 . "-10-01";
	// $arrParam[]	= $_REQUEST['i_year'] . "-09-30";

	// echo $sqlMain;
	// exit;
	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {
		$on = 0;
		while ($row = $db->Fetch($stmt)) {
			// $month = $row["month"];
			// echo($row["c_name"]);
			$temp = array(
				"no"                	=>	++$on,
				"i_type"     			=>  1,
		
				// "bg_expense_lv1_id"     =>  1,
				// "i_month"				=>	($date->l_month_thai[$month]),
				"bg_expense_id"									=>	$row["bg_expense_id"],
				"i_level"										=>	$row["i_level"]??null,
				"c_code"										=>	$row["c_code"]??null,
				"c_name"										=>	$row["c_name"],
				"f_budget_income"								=>	$row["f_budget_income"],
				"f_budget_income_reserve"						=>	$row["f_budget_income_reserve"],
				"f_budget_income_reserve_contract"				=>	$row["f_budget_income_reserve_contract"],
				"f_budget_income_withdrawing"					=>	$row["f_budget_income_withdrawing"] ,
				"f_budget_income_withdraw"						=>	$row["f_budget_income_withdraw"],
				"f_reserve_budget_income"						=>	$row["f_reserve_budget_income"],
				"f_budget_income_remaining"						=>	$row["f_budget_income_remaining"],
				// "f_budget_income_remaining"						=>	$row["f_budget_income"] - ($row["f_budget_income_reserve"] + $row["f_budget_income_reserve_contract"] + $row["f_budget_income_withdraw"]) ,
				// ($row["f_budget_income_reserve"] + $row["f_budget_income_reserve_contract"] + $row["f_budget_income_withdraw"]) ,
				"f_reserve_periodincome"						=>	$row["f_reserve_periodincome"]??null,
				"f_budget_bangkok"								=>	$row["f_budget_bangkok"]??null,
				"f_budget_bangkok_reserve"						=>	$row["f_budget_bangkok_reserve"]??null,
				"f_budget_bangkok_reserve_contract"				=>	$row["f_reserve_period_contrect"]??null,
				"f_budget_bangkok_withdrawing"					=>	$row["f_budget_bangkok_withdrawing"]??null,
				"f_budget_bangkok_withdraw"						=>	$row["f_budget_bangkok_withdraw"]??null,
				"f_reserve_budget_income_bangkok"				=>	$row["f_reserve_budget_income_bangkok"]??null,
				"f_budget_bangkok_remaining"					=>  $row["f_budget_bangkok_remaining"]??null,

				"f_budget_government"							=>	$row["f_budget_government"]??null,
				"f_budget_government_reserve"					=>	$row["f_budget_government_reserve"]??null,
				"f_reserve_budget_income_government"			=>	$row["f_reserve_budget_income_government"]??null,
				"f_budget_government_reserve_contract"			=>	$row["f_budget_government_reserve_contract"]??null,
				"f_budget_government_withdrawing"				=>	$row["f_budget_government_withdrawing"]??null,
				"f_budget_government_withdraw"					=>	$row["f_budget_government_withdraw"]??null,
				"f_budget_government_remaining"					=>  $row["f_budget_government_remaining"]??null,

			);
			${$root}[]	= $temp;
		}
		// $temp = array(
		// 	"i_type"        =>  99,
		// 	// "c_name"    =>	$$row["c_name"],
		// 	"f_budget_income"    =>	$f_budget_income,
		// 	// "c_name"    =>	$$row["c_name"],
		// 	// "f_budget_income_sum"    =>	$f_budget_income_sum,
		// 	// "total2"    =>	$total2??null,
		// 	// "total3"    =>	$total3??null,
		// 	// "total5"    =>	$total5,

		// 	// "f_sum"    =>	$f_sum,
		// );
		// ${$root}[]	= $temp;
		// print_r(${$root});
	}
	return json_encode(array("debug" => true,  $root => ${$root}));
	// echo json_encode(array("debug" => true,  $root => ${$root}));

	exit;
}
