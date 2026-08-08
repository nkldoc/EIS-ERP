<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/export/ArrayToXlsx.php");


$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con1 = null;
$con2 = null;
$con3 = null;

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status,$con1,$con2,$con3;
	// echo($_REQUEST["i_expense"]);
    // $text = "Apple, Banana, Cherry, Date";
    // $pieces = explode(", ", $text); // แบ่งข้อความด้วย ", " เป็นชิ้นย่อย
    // print_r($pieces); // ผลลัพธ์คือ Array ([0] => Apple [1] => Banana [2] => Cherry [3] => Date)

	$DB_NAME = '';
	$budget1 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND aa.dc_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";

	if ($_REQUEST["i_expense"] == 1) {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv1"]);
		// $for_id = explode(";", $_REQUEST["bg_expense_id_lv1"]);
		// $for_id = explode(";", $_REQUEST["bg_expense_id_lv1"]);
		$bg_expense1 = $for_id[0];
		$bg_expense2 = @$for_id[1];
		$bg_expense3 = @$for_id[2];
	} else if ($_REQUEST["i_expense"] == 2) {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv2"]);
		$bg_expense1 = $for_id[0];
		$bg_expense2 = @$for_id[1];
		$bg_expense3 = @$for_id[2];
	} else if ($_REQUEST["i_expense"] == 3) {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv3"]);
		$bg_expense1 = $for_id[0];
		$bg_expense2 = @$for_id[1];
		$bg_expense3 = @$for_id[2];
	} else {
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv4"]);
		$bg_expense1 = $for_id[0];
		$bg_expense2 = @$for_id[1];
		$bg_expense3 = @$for_id[2];
	}
	"	isnull((
		isnull((select  isnull(total,0)  from #tempAllexpense1 where month = a.[month] ),0) + 
		isnull((select  isnull(total,0)  from #tempAllexpense2 where month = a.[month] ),0) + 
		isnull((select  isnull(total,0)  from #tempAllexpense3 where month = a.[month] ),0)   
		),0)
		as f_sum";
	$expense_where2 = null ;
	$expense_where3 = null ;
	$select_expense2 = null ;
	$select_expense3 = null ;
	$con1 .= ($bg_expense1 != "") ? " AND cc.bg_expense_lv".$_REQUEST["i_expense"]."_id IN (" . $bg_expense1. ")" : "";
	$sum_expense = "		isnull((
		isnull((select  isnull(total,0)  from #tempAllexpense1 where month = a.[month] ),0)   
		),0)
		as f_sum ";
	if ($bg_expense2) {
		$con2 .= ($bg_expense2 != "") ? " AND cc.bg_expense_lv".$_REQUEST["i_expense"]."_id IN (" . $bg_expense2 . ")" : "";
		$select_expense2 = "	--2
		SELECT
				isnull(Right(convert(varchar,0) + convert(varchar,DATEPART(MONTH, d_create)),2),0) AS month,		
				SUM(isnull(aa.f_amt,0)) AS total
				,cc.bg_expense_lv".$_REQUEST["i_expense"]."_id as bg_expense
				INTO #tempAllexpense2	
		FROM NMU.dbo.bg_reserve_money aa
		INNER JOIN NMU.dbo.vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
		WHERE aa.i_enable = 1 AND aa.i_year = @i_year and aa.i_reserve = 1
		AND aa.f_amt > 0  {$con2} {$budget1}
			GROUP BY  DATEPART(MONTH, aa.d_create) 	,cc.bg_expense_lv".$_REQUEST["i_expense"]."_id " ;


		$expense_where2 = "isnull((select c_name from nmu..bg_expense where bg_expense_id =  {$bg_expense2}),0) as bg_expense2 ,
		isnull((select  isnull(total,0)  from #tempAllexpense2 where month = a.[month] ),0) as total2 ," ;
		$sum_expense = "		isnull((
			isnull((select  isnull(total,0)  from #tempAllexpense1 where month = a.[month] ),0) + 
			isnull((select  isnull(total,0)  from #tempAllexpense2 where month = a.[month] ),0)
			),0)
			as f_sum ";
	}
	if ($bg_expense3)  {	
		$con3 .= ($bg_expense3 != "") ? " AND cc.bg_expense_lv".$_REQUEST["i_expense"]."_id IN (" . $bg_expense3 . ")" : "";
		$select_expense3 = "	--3
				SELECT
						isnull(Right(convert(varchar,0) + convert(varchar,DATEPART(MONTH, d_create)),2),0) AS month,		
						SUM(isnull(aa.f_amt,0)) AS total
						,cc.bg_expense_lv".$_REQUEST["i_expense"]."_id as bg_expense
						INTO #tempAllexpense3	
				FROM NMU.dbo.bg_reserve_money aa
				INNER JOIN NMU.dbo.vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
				WHERE aa.i_enable = 1 AND aa.i_year = @i_year and aa.i_reserve = 1
				AND aa.f_amt > 0  {$con3} {$budget1}
					GROUP BY  DATEPART(MONTH, aa.d_create) 	,cc.bg_expense_lv".$_REQUEST["i_expense"]."_id";
		$expense_where3 = "isnull((select c_name from nmu..bg_expense where bg_expense_id =  {$bg_expense3}),0) as bg_expense2 ,
		isnull((select  isnull(total,0)  from #tempAllexpense3 where month = a.[month] ),0) as total3 ,
		" ;
		$sum_expense = "		isnull((
			isnull((select  isnull(total,0)  from #tempAllexpense1 where month = a.[month] ),0) + 
			isnull((select  isnull(total,0)  from #tempAllexpense2 where month = a.[month] ),0) + 
			isnull((select  isnull(total,0)  from #tempAllexpense3 where month = a.[month] ),0)   
			),0)
			as f_sum ";
	}
// echo($bg_expense3);
// exit;
	$sqlMain = "SET NOCOUNT ON
					-- สร้างตารางชั่วคราว #temp_month
					CREATE TABLE #temp_month
					(Month INT,);
					-- แทรกข้อมูลลงในตารางชั่วคราว
					INSERT INTO #temp_month (Month)
					VALUES (01),(02),(03),(04),(05),(06),(07),(08),(09),(10),(11), (12)
					--1
					DECLARE @i_year AS numeric = {$_REQUEST["i_year"]};
					SELECT
							isnull(Right(convert(varchar,0) + convert(varchar,DATEPART(MONTH, d_create)),2),0) AS month,		
							SUM(isnull(aa.f_amt,0)) AS total
							,isnull(cc.bg_expense_lv".$_REQUEST["i_expense"]."_id,0) as bg_expense
							INTO #tempAllexpense1		
					FROM NMU.dbo.bg_reserve_money aa
					INNER JOIN NMU.dbo.vw_bg_expense_with_parent cc ON aa.bg_expense_id = cc.bg_expense_lv4_id
					WHERE aa.i_enable = 1 AND aa.i_year = @i_year  and aa.i_reserve = 1
					AND aa.f_amt > 0  
					{$con1} {$budget1}
						GROUP BY  DATEPART(MONTH, aa.d_create) 	,cc.bg_expense_lv".$_REQUEST["i_expense"]."_id
					{$select_expense2}
					{$select_expense3}

					select 
						Right(convert(varchar,0) + convert(varchar, a.month),2) AS month,
					isnull((select c_name from nmu..bg_expense where bg_expense_id =  {$bg_expense1}),0) as bg_expense1 ,
					$expense_where2
					$expense_where3
					isnull((select  isnull(total,0)  from #tempAllexpense1 where month = a.[month] ),0) as total1 ,
					{$sum_expense}
					from #temp_month  a 
					order by month
					--DROP TABLE  #tempAllexpense1 ,#tempAllexpense2 ,#tempAllexpense3 , #temp_month;
	";
	// $arrParam[]	= $_REQUEST['i_year'] - 1 . "-10-01";
	// $arrParam[]	= $_REQUEST['i_year'] . "-09-30";

	// echo $sqlMain;
	
	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {
		$on = 0;
		$total1 = 0;
		$total2 = 0;
		$total3 = 0;
		$total4 = 0;
		$total5 = 0;
		$f_sum = 0;
		while ($row = $db->Fetch($stmt)) {
			$month = $row["month"];
			$temp = array(
				"no"                	=>	++$on,
				"i_type"     =>  1,
				"bg_expense_lv1_id"     =>  1,
				"i_month"				=>	($date->l_month_thai[$month]),
				"total1"				=>	$row["total1"],
				"total2"				=>	$row["total2"]??null,
				"total3"				=>	$row["total3"]??null,
				"bg_expense1"				=>	$row["bg_expense1"],
				// "total5"				=>	$row["total5"],
				"f_sum"					=>	$row["f_sum"],
			);
			${$root}[]	= $temp;
			$total1 += $row["total1"];
			$total2 += $row["total2"]??null;
			$total3 += $row["total3"]??null;
			// $bg_expense1 += $row["bg_expense1"];
			// $total5 += $row["total5"];
			$f_sum += $row["f_sum"];

			// $f_sum += ($date->l_month_thai[$month]);
		}
		$temp = array(
			"i_type"        =>  99,
			"total1"    =>	$total1,
			"total2"    =>	$total2??null,
			"total3"    =>	$total3??null,
			// "bg_expense1"    =>	$bg_expense1,
			// "total5"    =>	$total5,

			"f_sum"    =>	$f_sum,
		);
		${$root}[]	= $temp;
		// print_r(${$root});
	}
	// if ($stmt) {
	// 	$on = 0;
	// 	$count_bging = 0;
	// 	$f_sum = 0;
	// 	while ($row = $db->Fetch($stmt)) {

	// 		$temp = array(
	// 			"no"                =>	++$on,
	// 			"i_type"            =>  1,
	// 			"c_acc_code"		=>	$row["c_acc_code"],
	// 			"c_acc_name"		=>	$row["c_acc_name"],
	// 			"count_bging"		=>	$row["count_bging"],
	// 			"f_sum"			=>	$row["f_sum"],
	// 		);
	// 		${$root}[]	= $temp;
	// 		$count_bging += $row["count_bging"];
	// 		$f_sum += $row["f_sum"];
	// 	}
	// 	$temp = array(
	// 		"i_type"        =>  99,
	// 		"count_bging"    =>	$count_bging,
	// 		"f_sum"    =>	$f_sum,
	// 	);
	// 	${$root}[]	= $temp;
	// }
	return json_encode(array("debug" => true,  $root => ${$root}));
	// echo json_encode(array("debug" => true,  $root => ${$root}));

	exit;
}
