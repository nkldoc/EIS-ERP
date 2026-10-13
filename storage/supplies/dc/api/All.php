<?php

 include("../../conf/config.php");
 include("../../lib/database/DatabaseServer.php");
 include("../../lib/database/apiUtil.php");

 $db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;
 $limit = @$_REQUEST["limit"] ?? null;
 $dir = @$_REQUEST["dir"] ?? null;
 $sort = @$_REQUEST["sort"] ?? null;
 $start = @$_REQUEST["start"] ?? null;

 if ($_REQUEST['type'] == 'storeSpEmp') {

     $TEAM_TOR = " 2,3 "; //dc_department_type_id 23
     ###################
     $table = "dbo.sp_emp";
     $dc_department_type_id = $_REQUEST['dc_department_type_id'] ?? null;
     $sqlTempTable = "select a.c_name
                    , 'สายงาน '+b.c_name+' '+ CAST(b.i_seq AS varchar) as 'c_code'
                   , CASE
                        WHEN a.i_level = 1 THEN 'หัวหน้าหน่วยงาน'
                        WHEN a.i_level = 2 THEN 'หัวหน้าสายงาน'
                        ELSE 'ผู้ปฎิบัติงาน' END AS 'c_position'
                    , a.sp_emp_id
                    , a.dc_emp_id
                    , a.dc_department_id
                   , b.dc_department_type_id
                   , b.i_seq
                    , a.i_level
		 , ROW_NUMBER() OVER (ORDER BY a.dc_department_id asc) as row
                from dbo.sp_emp a
                  inner join sp_department b on b.dc_department_id = a.dc_department_id
                  inner join sp_department_type c on c.dc_department_type_id = a.dc_department_type_id
                where b.dc_department_type_id in (" . $TEAM_TOR . ") and a.i_level=3 and a.i_enable=?"; // and b.dc_department_id = " . $_SESSION['dc_department_id'];


     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(1, "%{$value}%", $start, $limit);
         $arrCountParam = array(1, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(1, $start, $limit);
         $arrCountParam = array(1);
     }

//     echo $sqlMain;
//     print_r($arrParam);
//     exit();

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;

     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => intval($row["sp_emp_id"]),
             "c_code" => $row["c_code"],
             "i_level" => intval($row["i_level"]),
             "i_parent" => intval($row["i_parent"]),
             "dc_dempartment_type_id" => intval($row["dc_dempartment_type_id"]),
             "dc_dempartment_id" => intval($row["dc_dempartment_id"]),
             "c_department" => $row["c_department"],
             "TextShow" => $row["c_name"] . " | " . $row["c_department"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeDepartment >>>';
 } else if ($_REQUEST['type'] == 'storeDepartment') {

     $TEAM_TOR = " 2,3 "; //dc_department_type_id 23
     ###################
     $table = "dbo.sp_emp";
     $dc_department_type_id = $_REQUEST['dc_department_type_id'] ?? null;
     $sqlTempTable = "select a.c_name  
                    , 'สายงาน '+b.c_name+' '+ CAST(b.i_seq AS varchar) as 'c_code'
                   , CASE
                        WHEN a.i_level = 1 THEN 'หัวหน้าหน่วยงาน'
                        WHEN a.i_level = 2 THEN 'หัวหน้าสายงาน'
                        ELSE 'ผู้ปฎิบัติงาน' END AS 'c_position'
                    , a.sp_emp_id
                    , a.dc_emp_id
                    , a.dc_department_id
                   , b.dc_department_type_id
                   , b.i_seq
                    , a.i_level
		 , ROW_NUMBER() OVER (ORDER BY a.dc_department_id asc) as row
                from dbo.sp_emp a
                  inner join sp_department b on b.dc_department_id = a.dc_department_id
                  inner join sp_department_type c on c.dc_department_type_id = a.dc_department_type_id
                where b.dc_department_type_id in (" . $TEAM_TOR . ") and a.i_level=2 and a.i_enable=?";


     if ($mode == "SEARCH") {
         if (isset($value) && $value != "") {
             $sqlTempTable .= " and " . $filter . " like ?";
         }
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(1, "%{$value}%", $start, $limit);
         $arrCountParam = array(1, "%{$value}%");
     } else {
         $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
         $arrParam = array(1, $start, $limit);
         $arrCountParam = array(1);
     }

//     echo $sqlMain;
//     print_r($arrParam);
//     exit();

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
 
     while ($row = $db->Fetch($stmt)) {
         $temp = array("no" => ($i++),
             "id" => intval($row["dc_department_id"]),
             "c_code" => $row["c_code"],
             "i_level" => intval($row["i_level"]),
             "i_parent" => intval($row["i_parent"]),
             "dc_dempartment_type_id" => intval($row["dc_dempartment_type_id"]),
             "dc_dempartment_id" => intval($row["dc_dempartment_id"]),
             "c_department" => $row["c_department"],
             "TextShow" => $row["c_name"] . " | " . $row["c_department"],
             "c_name" => $row["c_name"]
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     $debug = 'storeDepartment >>>';
 } else if ($_REQUEST["type"] == "dc_cost") {

     $sqlMain	= "
		SELECT * FROM dbo.dc_cost
		WHERE i_last = 1 AND i_enable = 1 AND i_delete = 2
			AND c_code_tree LIKE '0104%'
		ORDER BY c_code";
	$arrParam	= array(STATUS_ENABLE, 1);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_code"	=> "",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_cost_id"]}",
				"c_name"	=> $row["c_code"] . " : " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
	
} else if ($_REQUEST["type"] == "bg_project") {
	$sqlMain	= "select bg_budget_item_project_id  as id
	,c_name
	,f_project
	FROM dbo.bg_budget_item_project WHERE 1=?";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = true;
		// if ($all == "all") {
		// 	${$root}[] = array(
		// 		"id"		=> 0,
		// 		"c_name"	=> "- เลือกโครงการ-"
		// 	);
		// }

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> $row["id"] ,
				"c_name"	=> $row["c_name"] ." วงเงิน(". number_format($row["f_project"],2).") บาท " ,
				"f_project"	=> $row["f_project"] 
			);
			${$root}[] = $temp;
		}
	}	
} else if ($_REQUEST["type"] == "po_user") {
	$sqlMain	= "select a.dc_user_id,a.c_full_name from dbo.dc_user a 
	inner join dbo.dc_user_menu b on b.dc_user_id=a.dc_user_id
	where b.dc_menu_id =(SELECT dc_menu_id FROM dc_menu where c_filelocation='po-RegPo')
	AND a.i_enable = ?
	group by a.dc_user_id,a.c_full_name
	ORDER BY a.c_full_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = true;
		if ($all == "all") {
			${$root}[] = array(
				"id"		=> 0,
				"c_name"	=> "- เลือกผู้ทำรายการ-"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_user_id"]}",
				"c_name"	=> "{$row["c_full_name"]}"
			);
			${$root}[] = $temp;
		}
	}	
} else if ($_REQUEST["type"] == "po_creditor_transfer") {
	$sqlMain	= "SELECT * FROM dbo.po_creditor WHERE i_enable = ? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = false;
		if ($all == "all") {
			${$root}[] = array(
				"id"		=> 0,
				"c_name"	=> "- กรุณาเลือก -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["po_creditor_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}	
} else if ($_REQUEST["type"] == "po_creditor") {
	$sqlMain	= "SELECT * FROM dbo.po_creditor WHERE i_enable = ? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = false;
		if ($all == "all") {
			${$root}[] = array(
				"id"		=> 0,
				"c_name"	=> "- กรุณาเลือก -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["po_creditor_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_expense_budget_type") {

	$sqlMain	= "SELECT * FROM dbo.dc_expense_budget_type WHERE i_enable = ? AND i_delete = 2 ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_expense_budget_type_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_expense") {

	$sqlMain	= "SELECT * FROM dbo.po_expense WHERE i_last = 1 and i_enable = ? ORDER BY c_code_tree";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"					=> "{$row["po_expense_id"]}",
				"c_name"				=> $row["c_code"] . " : " . $row["c_name"],
				"c_name_excel"			=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
    } else if ($_REQUEST["type"] == "po_emp") {

     $sqlMain = "SELECT * FROM dbo.po_emp WHERE i_enable = ? AND i_delete = 2 ORDER BY c_name";
     $arrParam = array(STATUS_ENABLE);
     $stmt = $db->QueryParam($sqlMain, $arrParam);
     if ($stmt) {

         if (@$_REQUEST["all"] == "all") {
             ${$root}[] = array(
                 "id" => "0",
                 "c_name" => "- เลือกทั้งหมด -"
             );
         }

         while ($row = $db->Fetch($stmt)) {
             $temp = array(
                 "id" => "{$row["po_emp_id"]}",
                 "c_name" => $row["c_name"],
             );
             ${$root}[] = $temp;
         }
     }

     //sp_emp_level2
 } else if ($_REQUEST["type"] == "sp_emp_level2") {

     $sqlMain = "select a.c_name as 'c_emp'
                    , c.c_name as 'c_department_type'
                    , 'สายงาน '+b.c_name+' '+ CAST(b.i_seq AS varchar) as 'c_department'
                    , CASE
                        WHEN a.i_level = 1 THEN 'หัวหน้าหน่วยงาน'
                        WHEN a.i_level = 2 THEN 'หัวหน้าสายงาน'
                        ELSE 'ผู้ปฎิบัติงาน' END AS 'c_position'
                    , a.sp_emp_id
                    , a.dc_emp_id
                    , a.dc_department_id
                    , b.dc_department_type_id
                    , b.i_seq
                    , a.i_level
                    from dbo.sp_emp a
                    left join sp_department b on b.dc_department_id = a.dc_department_id
                    left join sp_department_type c on c.dc_department_type_id = b.dc_department_type_id
                    where a.i_level=2 and c.i_last=1
order by b.dc_department_type_id";
     $arrParam = array(STATUS_ENABLE);
     $stmt = $db->QueryParam($sqlMain, $arrParam);
     if ($stmt) {

         if (@$_REQUEST["all"] == "all") {
             ${$root}[] = array(
                 "id" => "0",
                 "c_name" => "- เลือกทั้งหมด -"
             );
         }

         while ($row = $db->Fetch($stmt)) {
             $temp = array(
                 "id" => "{$row["dc_emp_id"]}",
                 "c_name" => $row["c_emp"] . " | " . $row["c_department"],
             );
             ${$root}[] = $temp;
         }
     }
     //sp_emp_level23
 } else if ($_REQUEST["type"] == "sp_emp_level23") {
     $w = null;
     $w1 = null;
     $is_choosed_self = 1;

     if ($_SESSION['i_type_user'] == 2) {
        $w = "where a.i_enable= ? and a.i_level != 1";
     } else {
         if ($is_choosed_self) {
             $w = "where a.dc_department_id=" . $_SESSION['dc_department_id'] . " and a.i_level != 1";
         } else {
             $w = "where a.dc_department_id=" . $_SESSION['dc_department_id'] . " and a.i_level = 3";
         }
     }

     $sqlMain = "select aa.* from (select a.sp_emp_id
         , a.c_name
         , a.dc_department_id
         , a.c_department
         , a.i_parent
         , a.i_level
         , a.i_last 
         from sp_emp a " . $w . ") aa ";

     $arrParam = array();

     $arrParam[] = STATUS_ENABLE;
     $arrParam[] = STATUS_ENABLE;


     $stmt = $db->QueryParam($sqlMain, $arrParam);
     if ($stmt) {

         if (@$_REQUEST["all"] == "all") {
             ${$root}[] = array(
                 "id" => "0",
                 "c_name" => "- เลือกทั้งหมด -"
             );
         }

         while ($row = $db->Fetch($stmt)) {
             $temp = array(
                 "id" => "{$row["sp_emp_id"]}",
                 "c_name" => $row["c_name"] . " | " . $row["c_department"],
             );
             ${$root}[] = $temp;
         }
     }
 } else if ($_REQUEST["type"] == "po_user_permission") {

     $sqlMain = "
		SELECT * FROM dbo.dc_user a
			INNER JOIN dbo.po_user_permission b ON a.dc_user_id = b.dc_user_id AND b.i_approve = 1
		WHERE a.i_enable = ? AND a.i_delete = 2 ORDER BY a.c_full_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"					=> "{$row["dc_user_id"]}",
				"c_name"				=> $row["c_full_name"],

			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
