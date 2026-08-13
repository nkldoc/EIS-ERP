<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if($_REQUEST["type"] == "dc_user_create") {
	$sqlMain	= "	SELECT
						b.dc_user_id, c.c_name
					FROM dbo.gl_tran_hdr a
						INNER JOIN dbo.dc_user b ON a.dc_user_create_id = b.dc_user_id
						INNER JOIN dbo.dc_emp c ON b.dc_emp_id = c.dc_emp_id
					WHERE b.dc_user_id != 1 AND b.i_enable = ? AND b.i_delete = ?
					GROUP BY b.dc_user_id, c.c_name;";
	
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
		);
		while($row = $db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_user_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "dc_user_update") {
	$sqlMain	= "	SELECT
						b.dc_user_id, c.c_name
					FROM dbo.gl_tran_hdr a
						INNER JOIN dbo.dc_user b ON a.dc_user_update_id = b.dc_user_id
						INNER JOIN dbo.dc_emp c ON b.dc_emp_id = c.dc_emp_id
					WHERE b.dc_user_id != 1 AND b.i_enable = ? AND b.i_delete = ?
					GROUP BY b.dc_user_id, c.c_name;";
	
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
		);
		while($row =$db->Fetch($stmt))
		{
			$temp = array(
					"id"		=> "{$row["dc_user_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "vw_gl_dc_book_type") {
	$sqlMain	= "SELECT * FROM vw_gl_dc_book_type WHERE i_enable = ?";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["gl_dc_book_type_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "dc_acc") {
	$sqlMain	= "SELECT dc_acc_id, i_group, c_code+' '+c_name AS c_name FROM dbo.dc_acc WHERE i_level = 6 AND i_last = 1 AND i_enable = ? AND i_delete = ? ORDER BY c_code";
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_acc_id"]}",
					"i_group"	=> "{$row["i_group"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "vw_dc_cost_gl_last") {
	
	$sqlMain	= "SELECT * FROM vw_dc_cost_gl_last ORDER BY c_code";
	$arrParam	= array(null);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt))
		{
			$temp = array(
					"id"		=> "{$row["dc_cost_id"]}",
					"c_name"	=> $row["c_code"]." ".$row["dc_cost_acc_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "vw_product_class_type_new2") {
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	$mode 	= @$_REQUEST["mode"];
	$value	= @$_REQUEST["value"];
	$filter	= @$_REQUEST["filter"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 15; } else { $limit=($limit+$start); }
	
	if($mode == "SEARCH") {
		if($value != "") { $con	.= " AND {$filter} LIKE '%{$value}%' "; }
	}
	
	$sqlTempTable	= "	SELECT
							ROW_NUMBER() OVER (ORDER BY c_name) AS numrow,
							dc_product_id,
							c_code,
							c_name
						FROM vw_product_class_type_new2
						WHERE i_show_gl = 1 AND i_enable = ".STATUS_ENABLE."
						{$con}";
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.c_code";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	"no"		=> $row["numrow"],
							"id"		=> "{$row["dc_product_id"]}",
							"c_code"	=> "{$row["c_code"]}",
							"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
	
	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	
	echo json_encode(array("debug"=>true, $root=>${$root}, "totalCount"=>$totalCount));
	exit;
	
} else if($_REQUEST["type"] == "vw_dc_creditor") {
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	$mode 	= @$_REQUEST["mode"];
	$value	= @$_REQUEST["value"];
	$filter	= @$_REQUEST["filter"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 15; } else { $limit=($limit+$start); }
	
	if($mode == "SEARCH") {
		if($value != "") { $con	.= " AND {$filter} LIKE '%{$value}%' "; }
	}
	
	$sqlTempTable	= "	SELECT
							ROW_NUMBER() OVER (ORDER BY c_name) AS numrow
							,dc_creditor_id
							,c_code
							,c_name,
							c_firstname,
							c_surname,
							c_address,
							c_tax_value,
							c_ref_value
						FROM vw_dc_creditor
						WHERE i_enable = ".STATUS_ENABLE." {$con}";
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.c_firstname, a.c_surname";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt)){
			$temp = array(	"no"			=> $row["numrow"],
							"id"			=> "{$row["dc_creditor_id"]}",
							"c_code"		=> "{$row["c_code"]}",
							"c_name"		=> "{$row["c_name"]}",
							"c_address"		=> "{$row["c_address"]}",
							"c_tax_value"	=> "{$row["c_tax_value"]}",
							"c_ref_value"	=> "{$row["c_ref_value"]}"
			);
			${$root}[] = $temp;
		}
	}
	
	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	
	echo json_encode(array("debug"=>true, $root=>${$root}, "totalCount"=>$totalCount));
	exit;
	
} else if($_REQUEST["type"] == "vw_dc_debtor") {
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	$mode 	= @$_REQUEST["mode"];
	$value	= @$_REQUEST["value"];
	$filter	= @$_REQUEST["filter"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 15; } else { $limit=($limit+$start); }
	
	if($mode == "SEARCH") {
		if($value != "") { $con	.= " AND {$filter} LIKE '%{$value}%' "; }
	}
	
	$sqlTempTable	= "	SELECT
							ROW_NUMBER() OVER (ORDER BY c_name) AS numrow
							,dc_debtor_id
							,c_code
							,c_name,
							c_firstname,
							c_surname
						FROM vw_dc_debtor
						WHERE i_enable = ".STATUS_ENABLE." {$con}";
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.c_firstname, a.c_surname";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt)){
			$temp = array(	"no"		=> $row["numrow"],
							"id"		=> "{$row["dc_debtor_id"]}",
							"c_code"	=> "{$row["c_code"]}",
							"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
	
	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	
	echo json_encode(array("debug"=>true, $root=>${$root}, "totalCount"=>$totalCount));
	exit;
	
} else if($_REQUEST["type"] == "vw_show_emp_name_gl0201b") {
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	$mode 	= @$_REQUEST["mode"];
	$value	= @$_REQUEST["value"];
	$filter	= @$_REQUEST["filter"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 15; } else { $limit=($limit+$start); }
	
	if($mode == "SEARCH") {
		if($value != "") { $con	.= " AND a.{$filter} LIKE '%{$value}%' "; }
	}
	
	$sqlTempTable	= "	SELECT
							ROW_NUMBER() OVER (ORDER BY a.c_name) AS numrow,
							a.dc_emp_id,
							a.c_code,
							a.c_name,
							a.c_first_name,
							b.c_address,
							b.c_tax_value,
							b.c_ref_value
						FROM vw_show_emp_name_gl0201b a
							LEFT JOIN dc_emp b ON a.dc_emp_id = b.dc_emp_id	
						WHERE a.i_enable = ".STATUS_ENABLE." AND a.c_resign = 1 {$con}";
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.c_first_name";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	"no"			=> $row["numrow"],
							"id"			=> "{$row["dc_emp_id"]}",
							"c_code"		=> "{$row["c_code"]}",
							"c_name"		=> "{$row["c_name"]}",
							"c_first_name"	=> "{$row["c_first_name"]}",
							"c_address"		=> "{$row["c_address"]}",
							"c_tax_value"	=> "{$row["c_tax_value"]}",
							"c_ref_value"	=> "{$row["c_ref_value"]}"
			);
			${$root}[] = $temp;
		}
	}
	
	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	
	echo json_encode(array("debug"=>true, $root=>${$root}, "totalCount"=>$totalCount));
	exit;
	
} else if($_REQUEST["type"] == "vw_c_other") {
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	$mode 	= @$_REQUEST["mode"];
	$value	= @$_REQUEST["value"];
	$filter	= @$_REQUEST["filter"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 15; } else { $limit=($limit+$start); }
	
	if($mode == "SEARCH") {
		if($value != "") { $con	.= " AND {$filter} LIKE '%{$value}%' "; }
	}
	
	$sqlTempTable	= "	SELECT
							ROW_NUMBER() OVER (ORDER BY c_name) AS numrow,
							my_id,
							c_code,
							c_name
						FROM vw_c_other
						WHERE 1=1 {$con}";
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.c_name";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	"no"		=> $row["numrow"],
							"id"		=> "{$row["numrow"]}",
							"c_code"	=> "{$row["c_code"]}",
							"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
	
	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	
	echo json_encode(array("debug"=>true, $root=>${$root}, "totalCount"=>$totalCount));
	exit;
	
} else if($_REQUEST["type"] == "dc_expense_budget_type") {
	
	$sqlMain	= "	SELECT * FROM dbo.dc_expense_budget_type a
					WHERE a.i_enable = ? AND a.i_delete = ?
					ORDER BY a.c_name";
	
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		
		if(@$_REQUEST["all"] == "all") {
			${$root}[] = array(
					"id"		=> "0",
					"c_name"	=> "- เลือกทั้งหมด -"
			);
		}
			
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_expense_budget_type_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
	
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>