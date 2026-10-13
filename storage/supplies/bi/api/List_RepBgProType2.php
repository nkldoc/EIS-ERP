<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam($sp_emp,$m,$yyyy)
{
	global $db, $date, $root, $data, $con, $arr_status;

	$totalCount = 0;
	$f_for_debt = 0;
	$yc = 0;
	$y1 = 0;
	$y2 = 0;
	$y3 = 0;
	$y4 = 0;
	$y5 = 0;
	$yl = 0;
	$re = 0;
        // setParam
	$month  = sprintf("%02d", $m);
	$year   = sprintf("%04d", $yyyy); 
        //$i_groupMenu = "and b.i_groupMenu in (1,2,3,4,5,6,7,8)";
        
	$sqlMain = "SELECT distinct a.dc_expense_budget_type_id
		, (select c_name from dc_expense_budget_type where dc_expense_budget_type_id =a.dc_expense_budget_type_id ) as c_bg_name
		, (select count(tor_id) from dbo.sp_bg_monthly_group_menu where i_groupMenu =1 and dc_expense_budget_type_id =a.dc_expense_budget_type_id) as i_groupMenu1
		, (select count(tor_id) from dbo.sp_bg_monthly_group_menu where i_groupMenu =2 and dc_expense_budget_type_id =a.dc_expense_budget_type_id) as i_groupMenu2
		, (select count(tor_id) from dbo.sp_bg_monthly_group_menu where i_groupMenu =3 and dc_expense_budget_type_id =a.dc_expense_budget_type_id) as i_groupMenu3
		, (select count(tor_id) from dbo.sp_bg_monthly_group_menu where i_groupMenu =4 and dc_expense_budget_type_id =a.dc_expense_budget_type_id) as i_groupMenu4
		, (select count(tor_id) from dbo.sp_bg_monthly_group_menu where i_groupMenu =5 and dc_expense_budget_type_id =a.dc_expense_budget_type_id) as i_groupMenu5
		, (select count(tor_id) from dbo.sp_bg_monthly_group_menu where i_groupMenu =6 and dc_expense_budget_type_id =a.dc_expense_budget_type_id) as i_groupMenu6
		, (select count(tor_id) from dbo.sp_bg_monthly_group_menu where i_groupMenu =7 and dc_expense_budget_type_id =a.dc_expense_budget_type_id) as i_groupMenu7
		, (select count(tor_id) from dbo.sp_bg_monthly_group_menu where i_groupMenu =8 and dc_expense_budget_type_id =a.dc_expense_budget_type_id) as i_groupMenu8
		, (select count(tor_id) from dbo.sp_bg_monthly_group_menu where dc_expense_budget_type_id = a.dc_expense_budget_type_id and i_groupMenu in (1,2,3,4,5,6,7,8)) as total 
		, cast(
        (select count(tor_id) from dbo.sp_bg_monthly_group_menu where dc_expense_budget_type_id = a.dc_expense_budget_type_id and i_groupMenu in (1,2,3,4,5,6,7,8)) * 100.00
		 / (select count(tor_id) from dbo.sp_bg_monthly_group_menu where i_groupMenu in (1,2,3,4,5,6,7,8)
		 ) as decimal(18,2)) as percetage  
		FROM dbo.sp_bg_monthly_group_menu a
                where a.mm =? and a.yyyy = ?
		group by a.dc_expense_budget_type_id,a.i_groupMenu";

	$arrParam[] = $month;
	$arrParam[] = $year;
//       echo $sqlMain; 
//       print_r($arrParam);
//       exit();
       
        $i=0;
	$stmt = $db->QueryParam($sqlMain, $arrParam);

 
	if ($stmt) {
           
		while ($row = $db->Fetch($stmt)) { 
			$temp = array(
				 
				"no"				=> ++$i,
				"dc_expense_budget_type_id"     => intVal($row["dc_expense_budget_type_id"]),
				"c_bg_name"     => $row["c_bg_name"],
				"i_groupMenu1"	=> intVal($row["i_groupMenu1"]),
				"i_groupMenu2"	=> intVal($row["i_groupMenu2"]),
				"i_groupMenu3"	=> intVal($row["i_groupMenu3"]),
				"i_groupMenu4"	=> intVal($row["i_groupMenu4"]),
				"i_groupMenu5"	=> intVal($row["i_groupMenu5"]),
				"i_groupMenu6"	=> intVal($row["i_groupMenu6"]),
				"i_groupMenu7"	=> intVal($row["i_groupMenu7"]),
				"i_groupMenu8"	=> intVal($row["i_groupMenu8"]),
                                "total"		=> $row["total"],
				"percetage"     => floatVal($row["percetage"]),
			); 
                        ${$root}[] = $temp; 
		} 
	}
	return json_encode(array(
		"debug"				=> true,
		$root				=> ${$root},
		"totalCount"                    => $i, 
	));
}

// 
//$f1 = json_decode(List_QueryParam(2,2023)); 
//$sp_emp_id = 0; 
//
//foreach($f1->data as $k=>$v){
//    
////    if($v->sp_emp_id === $sp_emp_id){
//        echo "<div style='border:1px solid #eee;'>";
//            print($v->c_department); 
//            print($v->c_emp);  
//            print($v->no);  
//            print($v->groupMenu); 
//            print($v->percetage); 
//        echo "</div>";
////    } 
//    $sp_emp_id = $v->sp_emp_id;   
//}   
// 
//exit();