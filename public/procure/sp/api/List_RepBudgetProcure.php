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
	$DBNAME =  "NMU..";
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
				$con_1 = ($in != "") ? " AND cc.bg_expense_lv{$Income_Lv}_id IN (SELECT a.bg_expense_lv{$Income_Lv}_id FROM {$DBNAME} vw_bg_expense_with_parent a WHERE a.bg_expense_lv3_id IN (" . $in . "))" : "";
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
				$con_1 = ($in != "") ? " AND cc.bg_expense_lv{$Income_Lv}_id IN (SELECT a.bg_expense_lv{$Income_Lv}_id FROM {$DBNAME} vw_bg_expense_with_parent a WHERE a.bg_expense_lv4_id IN (" . $in . "))" : "";
			}
		}
	}

	$sqlMain = "
	        
    SET NOCOUNT ON
		DECLARE @i_year AS numeric = {$_REQUEST["i_year"]};
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
                    {$con} {$budget1}
                GROUP BY bb.bg_expense_id, bg_expense_lv2_id;
                

         /* โอนเปลี่ยนแปลง */
		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_change, 0)) AS f_total_D
			INTO #tempDiscount
		FROM NMU.. bg_budget_hdr_change aa
			INNER JOIN NMU.. bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id and ISNULL(bb.i_extenal,0) != 1
			INNER JOIN NMU.. vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1 
			AND aa.i_year = @i_year 
			AND i_type = 1
			{$con} {$budget1}
		GROUP BY bb.bg_expense_id;

		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_change, 0)) AS f_total_E
			INTO #tempExtra
		FROM NMU.. bg_budget_hdr_change aa
			INNER JOIN NMU.. bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id and ISNULL(bb.i_extenal,0) != 1
			INNER JOIN NMU.. vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1 
			AND aa.i_year = @i_year  
			AND i_type = 2	
			{$con} {$budget1}
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
			FROM NMU.. bg_budget_hdr_transfer aa
				INNER JOIN NMU.. bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
				INNER JOIN NMU.. vw_bg_expense_with_parent cc ON bb.bg_expense_begin_id = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1 AND aa.i_transfer = 1
				AND aa.i_year = @i_year
				AND bb.f_total > 0
				{$con} {$budget1}
			GROUP BY bb.bg_expense_begin_id
			UNION ALL
			SELECT
				bb.bg_expense_end_id AS bg_expense_id
				,SUM(ISNULL(bb.f_total, 0)) AS f_total
			FROM NMU.. bg_budget_hdr_transfer aa
				INNER JOIN NMU.. bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
				INNER JOIN NMU.. vw_bg_expense_with_parent cc ON bb.bg_expense_end_id = cc.bg_expense_lv4_id
			WHERE aa.i_enable = 1 AND aa.i_transfer = 1
				AND aa.i_year = @i_year
				AND bb.f_total > 0
				{$con} {$budget1}
			GROUP BY bb.bg_expense_end_id
		) z;

		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_change, 0)) AS f_total_D
			INTO #tempDiscount_income
		FROM NMU.. bg_budget_hdr_income_change aa
			INNER JOIN NMU.. bg_budget_dtl_income_change bb ON aa.bg_budget_hdr_income_change_id = bb.bg_budget_hdr_income_change_id and ISNULL(bb.i_extenal,0) != 1
			INNER JOIN NMU.. vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1 
			AND aa.i_year = @i_year
			AND i_type = 1	 
			{$con} {$budget1} AND bb.dc_cost_id = 38
		GROUP BY bb.bg_expense_id;

		SELECT
			bb.bg_expense_id
			,SUM(ISNULL(bb.f_change, 0)) AS f_total_E
			INTO #tempExtra_income
		FROM NMU.. bg_budget_hdr_income_change aa
			INNER JOIN NMU.. bg_budget_dtl_income_change bb ON aa.bg_budget_hdr_income_change_id = bb.bg_budget_hdr_income_change_id and ISNULL(bb.i_extenal,0) != 1
			INNER JOIN NMU.. vw_bg_expense_with_parent cc ON bb.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1 
			AND aa.i_year = @i_year
			AND i_type = 2
			  AND aa.dc_expense_budget_type_id = 4  AND bb.dc_cost_id = 38
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



		/* รอจองเงินอุดหนุน (ยังไม่ให้ทำสัญญา) */
			SELECT isnull(aa.po_expense_id,0) as po_expense_id 
				,sum(CASE WHEN aa.i_purchase =1 THEN f.f_unit_price ELSE a.f_type_amt END) AS f_total_erp
				INTO #tempBudget_period_bg
			FROM vw_sp_budget_type3 a
			left join dbo.sp_tor aa on aa.tor_id=a.tor_id
			left join dbo.sp_tor_dtl f on f.sp_tor_id=aa.tor_id 
			right join NMU_ERP.dbo.sp_tor_item bb on aa.tor_id = bb.tor_id
			INNER JOIN NMU.dbo.vw_bg_expense_with_parent cc ON aa.po_expense_id = cc.bg_expense_lv4_id
			where aa.i_period_bg = 1 
			and aa.bg_reserve_money1_id is null 
			and bb.sp_status_hdr_id= 13 
			and isnull(aa.po_expense_id,0) > 0
			and aa.i_yyyy =  @i_year
			and aa.i_type_bg =  1
			{$budget4} {$con}
			group by aa.po_expense_id

	/* เงินจอง PR แผน นับจากการจอง PR */
	select  
	isnull(aa.bg_expense_id,0) as po_expense_id
		,SUM(ISNULL(aa.f_amt, 0)) AS f_total_pr_type1
		INTO #tempBudget_sum_pr_type1
	from nmu..bg_reserve_money aa
	INNER JOIN NMU.. vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
	where aa.i_reserve =  1 and aa.i_enable = 1   and i_pr_type = 1 
	and aa.i_year =  @i_year 
	{$con} {$budget3}
	group by aa.bg_expense_id 

	/* เงินจอง PR งวด นับจากการจอง PR */
	select  
	isnull(aa.bg_expense_id,0) as po_expense_id
		,SUM(ISNULL(aa.f_amt, 0)) AS f_total_pr_type2
		INTO #tempBudget_sum_pr_type2
	from nmu..bg_reserve_money aa
	INNER JOIN NMU.. vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
	where aa.i_reserve =  1 and aa.i_enable = 1   and i_pr_type = 2 
	and aa.i_year =  @i_year 
	{$con} {$budget3}
	group by aa.bg_expense_id

/* รวมข้อมูล */
		SELECT * 
            ,isnull(a.f_total_pr_type1,0) + isnull(a.f_total_pr_type2,0) as f_sum_total_pr_type
			,(ISNULL(a.f_budget,0)+ISNULL(a.f_budget_adjust,0)) - (isnull(a.f_total_pr_type1,0) + isnull(a.f_total_pr_type2,0))as f_sum_budget0 
			,(ISNULL(a.f_budget,0)+ISNULL(a.f_budget_adjust,0))  - (isnull(a.f_total_pr_type1,0) + isnull(a.f_total_pr_type2,0) + ISNULL(a.f_total_erp,0))  as f_sum_budget_erp 
			-- ,0 as f_sum_budget0  

		INTO #tempData
		FROM (
			SELECT
				CASE
				WHEN a.bg_expense_id IS NOT NULL THEN a.bg_expense_id
				WHEN b.bg_expense_id IS NOT NULL THEN b.bg_expense_id
				WHEN c.bg_expense_id IS NOT NULL THEN c.bg_expense_id

				END AS bg_expense_id ,
                a.f_total AS f_budget
				,ISNULL(b.f_total,0) + ISNULL(c.f_total,0) AS f_budget_adjust


				,isnull(erp.f_total_erp,0) as f_total_erp

				-- ,rev.f_total_rev
				,isnull(pr1.f_total_pr_type1,0) as  f_total_pr_type1
				,isnull(pr2.f_total_pr_type2,0) as  f_total_pr_type2


			FROM #tempBudget a
			FULL JOIN #tempBudgetAdjust b ON a.bg_expense_id = b.bg_expense_id
			FULL JOIN #tempBudgetTransfer c ON a.bg_expense_id = c.bg_expense_id
			FULL JOIN #tempBudget_period_bg erp ON erp.po_expense_id = a.bg_expense_id
			FULL JOIN #tempBudget_sum_pr_type1 pr1 ON pr1.po_expense_id = a.bg_expense_id
			FULL JOIN #tempBudget_sum_pr_type2 pr2 ON pr2.po_expense_id = a.bg_expense_id

		) a

		/* แสดงข้อมูล */
		SELECT
			b.bg_expense_lv1_id AS bg_expense_id
			,1 AS i_level
			,b.c_code_lv1 AS c_code
			,b.c_name_lv1 AS c_name

			,(SUM(ISNULL(a.f_budget,0))) + (SUM(ISNULL(a.f_budget_adjust,0))) AS f_budget 
			,SUM(ISNULL(a.f_total_erp,0)) AS f_total_erp 
			,SUM(ISNULL(a.f_total_pr_type1,0)) AS f_total_pr_type1 
			,SUM(ISNULL(a.f_total_pr_type2,0)) AS f_total_pr_type2
			,SUM(ISNULL(a.f_sum_total_pr_type,0)) AS f_sum_total_pr_type
			,SUM(ISNULL(a.f_sum_budget0,0)) AS f_sum_budget0 
			,SUM(ISNULL(a.f_sum_budget_erp,0)) AS f_sum_budget_erp 
		FROM #tempData a
			LEFT JOIN NMU.. vw_bg_expense_with_parent b ON a.bg_expense_id = b.bg_expense_lv4_id OR a.bg_expense_id = b.bg_expense_lv2_id
		GROUP BY b.bg_expense_lv1_id, b.c_code_lv1, b.c_name_lv1
		UNION ALL
		SELECT
			b.bg_expense_lv2_id AS bg_expense_id
			,2 AS i_level
			,b.c_code_lv2 AS c_code
			,b.c_name_lv2 AS c_name
		    ,(SUM(ISNULL(a.f_budget,0))) + (SUM(ISNULL(a.f_budget_adjust,0))) AS f_budget 
			,SUM(ISNULL(a.f_total_erp,0)) AS f_total_erp 
			,SUM(ISNULL(a.f_total_pr_type1,0)) AS f_total_pr_type1 
			,SUM(ISNULL(a.f_total_pr_type2,0)) AS f_total_pr_type2
			,SUM(ISNULL(a.f_sum_total_pr_type,0)) AS f_sum_total_pr_type
			,SUM(ISNULL(a.f_sum_budget0,0)) AS f_sum_budget0 
			,SUM(ISNULL(a.f_sum_budget_erp,0)) AS f_sum_budget_erp 
		FROM #tempData a
			LEFT JOIN NMU.. vw_bg_expense_with_parent b ON a.bg_expense_id = b.bg_expense_lv4_id OR a.bg_expense_id = b.bg_expense_lv2_id
		GROUP BY b.bg_expense_lv2_id, b.c_code_lv2, b.c_name_lv2 
		UNION ALL
		SELECT
			b.bg_expense_lv3_id AS bg_expense_id
			,3 AS i_level
			,b.c_code_lv3 AS c_code
			,b.c_name_lv3 AS c_name
		    ,(SUM(ISNULL(a.f_budget,0))) + (SUM(ISNULL(a.f_budget_adjust,0))) AS f_budget 
			,SUM(ISNULL(a.f_total_erp,0)) AS f_total_erp 
			,SUM(ISNULL(a.f_total_pr_type1,0)) AS f_total_pr_type1 
			,SUM(ISNULL(a.f_total_pr_type2,0)) AS f_total_pr_type2
			,SUM(ISNULL(a.f_sum_total_pr_type,0)) AS f_sum_total_pr_type
			,SUM(ISNULL(a.f_sum_budget0,0)) AS f_sum_budget0 
			,SUM(ISNULL(a.f_sum_budget_erp,0)) AS f_sum_budget_erp 
		FROM #tempData a
			LEFT JOIN NMU.. vw_bg_expense_with_parent b ON a.bg_expense_id = b.bg_expense_lv4_id OR a.bg_expense_id = b.bg_expense_lv2_id
		GROUP BY b.bg_expense_lv3_id, b.c_code_lv3, b.c_name_lv3
		UNION ALL
		SELECT
			b.bg_expense_lv4_id AS bg_expense_id
			,4 AS i_level
			,b.c_code_lv4 AS c_code
			,b.c_name_lv4 AS c_name
		    ,(SUM(ISNULL(a.f_budget,0))) + (SUM(ISNULL(a.f_budget_adjust,0))) AS f_budget 
			,SUM(ISNULL(a.f_total_erp,0)) AS f_total_erp 
			,SUM(ISNULL(a.f_total_pr_type1,0)) AS f_total_pr_type1 
			,SUM(ISNULL(a.f_total_pr_type2,0)) AS f_total_pr_type2
			,SUM(ISNULL(a.f_sum_total_pr_type,0)) AS f_sum_total_pr_type
			,SUM(ISNULL(a.f_sum_budget0,0)) AS f_sum_budget0 
			,SUM(ISNULL(a.f_sum_budget_erp,0)) AS f_sum_budget_erp 
		FROM #tempData a
			LEFT JOIN NMU.. vw_bg_expense_with_parent b ON a.bg_expense_id = b.bg_expense_lv4_id OR a.bg_expense_id = b.bg_expense_lv2_id
		GROUP BY b.bg_expense_lv4_id, b.c_code_lv4, b.c_name_lv4
		ORDER BY c_code;

				
		DROP TABLE #tempBudget,#tempBudgetAdjust,#tempBudgetTransfer,#tempData,#tempDiscount,#tempExtra
        ,#tempBudgetAdjust_income,#tempDiscount_income,#tempExtra_income,#tempBudget_period_bg
		,#tempBudget_sum_pr_type1,#tempBudget_sum_pr_type2
		

	


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
		$f_budget = 0;
		$f_total_erp = 0;
		$f_total_pr_type1 = 0;
		$f_total_pr_type2 = 0;
		$f_sum_total_pr_type = 0;
		$f_sum_budget0 = 0;
		$f_sum_budget_erp = 0;

			

		while ($row = $db->Fetch($stmt)) {
			if ($row["i_level"] == 1) {
				$no++;


				$f_budget	+=	$row["f_budget"];
				$f_total_erp	+=	$row["f_total_erp"];
				$f_total_pr_type1	+=	$row["f_total_pr_type1"];
				$f_total_pr_type2	+=	$row["f_total_pr_type2"];
				$f_sum_total_pr_type	+=	$row["f_sum_total_pr_type"];
				$f_sum_budget0	+=	$row["f_sum_budget0"];
				$f_sum_budget_erp	+=	$row["f_sum_budget_erp"];

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

					"f_budget"							=>	$row["f_budget"],
					"f_total_erp"						=>	$row["f_total_erp"],
					"f_total_pr_type1"					=>	$row["f_total_pr_type1"],
					"f_total_pr_type2"					=>	$row["f_total_pr_type2"],
					"f_sum_total_pr_type"				=>	$row["f_sum_total_pr_type"],
					"f_sum_budget0"						=>	$row["f_sum_budget0"],
					"f_sum_budget_erp"					=>	$row["f_sum_budget_erp"],
				);
				${$root}[]	= $temp;
			}
		}

		$temp = array(
			"no"                                => $no,
			"i_type"                            => 2,
			"c_name"                            => "รวมทั้งสิ้น",

			"f_budget"							=>	$f_budget,
			"f_total_erp"						=>	$f_total_erp,
			"f_total_pr_type1"					=>	$f_total_pr_type1,
			"f_total_pr_type2"					=>	$f_total_pr_type2,
			"f_sum_total_pr_type"				=>	$f_sum_total_pr_type,
			"f_sum_budget0"						=>	$f_sum_budget0,
			"f_sum_budget_erp"					=>	$f_sum_budget_erp,

		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
