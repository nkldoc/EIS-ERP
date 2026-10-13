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
        $i_groupMenu = "and b.i_groupMenu in (1,2,3,4,5,6,7,8)";
        // 
	$sqlMain = "select  isnull(a.dc_department_id,0) as dc_department_id 
	, a.sp_emp_id 
	, (select count(c_pr_code) from dbo.sp_montyly_resulte where i_product_type = 2 and i_groupMenu =b.i_groupMenu and sp_emp_id = a.sp_emp_id) as i_product_type2 
	, (select c_name from sp_department where dc_department_id = a.dc_department_id) as c_department
	, (select c_name from sp_emp where sp_emp_id = a.sp_emp_id) as c_emp
	, a.mm ,a.yyyy  ,b.groupMenu,b.i_groupMenu  
	, (select count(c_pr_code) from dbo.sp_montyly_resulte where i_groupMenu =b.i_groupMenu  and i_type=4 and sp_emp_id = a.sp_emp_id) as ebidding
	, (select count(c_pr_code) from dbo.sp_montyly_resulte where i_groupMenu =b.i_groupMenu  and i_type=3 and sp_emp_id = a.sp_emp_id) as finding
	, (select count(c_pr_code) from dbo.sp_montyly_resulte where i_groupMenu =b.i_groupMenu  and i_type=11 and sp_emp_id = a.sp_emp_id) as less5
	, (select count(c_pr_code) from dbo.sp_montyly_resulte where i_groupMenu =b.i_groupMenu  and i_type=12 and sp_emp_id = a.sp_emp_id) as more5
	, (select count(c_pr_code) from dbo.sp_montyly_resulte where i_groupMenu =b.i_groupMenu  and sp_emp_id = a.sp_emp_id and i_type in (4,3,11,12)) as total 
	, cast(
                (select count(c_pr_code) from dbo.sp_montyly_resulte where i_groupMenu = b.i_groupMenu and sp_emp_id = a.sp_emp_id and i_type in (4,3,11,12)) * 100.00
		 / (select count(c_pr_code) from dbo.sp_montyly_resulte where sp_emp_id = a.sp_emp_id and i_type in (4,3,11,12)
		 ) as decimal(18,2)) as percetage  
	from dbo.sp_montyly_resulte a
        right join dbo.sp_montyly_resulte b on b.i_groupMenu = b.i_groupMenu {$i_groupMenu}
	where a.sp_emp_id <> 0 and a.mm=? and a.yyyy=? {$sp_emp}
	group by a.dc_department_id,a.sp_emp_id , a.mm ,a.yyyy   ,b.groupMenu,b.i_groupMenu  
	order by a.dc_department_id ,a.sp_emp_id , b.i_groupMenu";

	$arrParam[] = $month;
	$arrParam[] = $year;
//       echo $sqlMain; 
//       print_r($arrParam);
//       exit();
       

	$stmt = $db->QueryParam($sqlMain, $arrParam);

 
	if ($stmt) {
            $i=0;
		while ($row = $db->Fetch($stmt)) { 
			$temp = array(
				 
				"no"				=> ++$i,
				"sp_emp_id"		=> intVal($row["sp_emp_id"]),
				"i_product_type2"	=> intVal($row["i_product_type2"]),
				"c_department"		=> $row["c_department"],
				"c_emp"                 => $row["c_emp"],
				"groupMenu"		=> $row["groupMenu"],
				"i_groupMenu"		=> $row["i_groupMenu"],
				"ebidding"		=> $row["ebidding"],
				"finding"		=> $row["finding"],
				"less5"			=> $row["less5"],
				"more5"			=> $row["more5"],
				"total"			=> $row["total"],
				"percetage"		=> floatVal($row["percetage"]),
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