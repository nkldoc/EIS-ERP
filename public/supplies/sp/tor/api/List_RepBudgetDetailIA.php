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
	$DBNAMENMU =  "NMU..";
	$DBNAME =  "NMU_ERP..";
	global $db, $date, $root, $data, $con, $arr_status;

	$con_1 = null;
	$totalCount = 0;
	$budget = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND aa.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";
	// $Income_Lv = $_REQUEST["i_year"] < 2022 ? '2' : '4';
	// $Income_Lv_null = $_REQUEST["i_year"] < 2022 ? '_lv2' : '';
	// $Lv4_enable = $_REQUEST["i_year"] < 2022 ? '--' : '';
	// $Lv2_enable = $_REQUEST["i_year"] < 2022 ? '' : '--';

	$sqlMain = "SET NOCOUNT ON
		DECLARE @i_year AS numeric = {$_REQUEST["i_year"]};
		select * into #temp_vw_bg_expense_with_parent from {$DBNAMENMU}vw_bg_expense_with_parent

		
		/* งบประมาณตามบัญชีจัดสรร */
		SELECT
			aa.po_expense_id
			,cc.bg_expense_lv4_id
			,SUM(ISNULL(aa.f_total_amt, 0)) AS f_total
		INTO #tempBudget
		FROM NMU_ERP..sp_tor aa
			INNER JOIN #temp_vw_bg_expense_with_parent cc ON aa.po_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enabled = 1
			AND aa.i_yyyy = @i_year
			AND aa.f_total_amt != 0
			and aa.i_type_bg = 12 
			and aa.i_type_bg = 12 
			{$budget}
			GROUP BY  cc.bg_expense_lv4_id,aa.po_expense_id;
		
		/* รวมข้อมูล */
		SELECT * 
			
		INTO #tempData
		FROM (
			SELECT
				CASE
				WHEN a.bg_expense_lv4_id IS NOT NULL THEN a.bg_expense_lv4_id
				END AS bg_expense_id
				, a.f_total AS f_budget
				-- ,pr1.f_total_pr_type1
			FROM #tempBudget a

		) a
		/* แสดงข้อมูล */
		SELECT
		    row_number() over (order by b.c_code_lv4 ) as row
			,b.bg_expense_lv4_id AS bg_expense_id
			,4 AS i_level
			,b.c_code_lv4 AS c_code
			,b.c_name_lv4 AS c_name
			,SUM(ISNULL(a.f_budget,0)) AS f_budget
		FROM #tempData a
			LEFT JOIN #temp_vw_bg_expense_with_parent b ON a.bg_expense_id = b.bg_expense_lv4_id 
		GROUP BY b.bg_expense_lv4_id, b.c_code_lv4, b.c_name_lv4
		ORDER BY c_code;
	
		DROP TABLE #tempBudget
		,#tempData
		,#temp_vw_bg_expense_with_parent
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
	// exit;
	if ($stmt) {
		$no = 0;

		$f_budget                          	= 0;
			

		while ($row = $db->Fetch($stmt)) {
			if ($row["i_level"] == 4) {
				$no++;

				$f_budget                          		+=	$row["f_budget"]; /*A1*/
				// $f_budget_adjust                   	+=	$row["f_budget_adjust"]; /*A2*/

			}

			 {
				$temp = array(
					"no"                                => $no,
					"i_type"                            => 1,
					"row" 	                    		=>	$row["row"],
					"bg_expense_id"                     =>	$row["bg_expense_id"],
					"i_level"                           =>	$row["i_level"],
					"c_code"                            =>	$row["c_code"],
					"c_name"                            =>	$row["c_name"],
					"f_budget"                          =>	$row["f_budget"],
				);
				${$root}[]	= $temp;
			}
		}
		$temp = array(
			"no"                                => $no,
			"i_type"                            => 2,
			"c_name"                            => "รวมทั้งสิ้น",
			"f_budget"                    =>	$f_budget, /*A1*/
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
