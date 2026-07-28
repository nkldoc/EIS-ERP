<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;
$DBNAME =  "NMU..";

if ($_REQUEST["type"] == "bg_expense") {

	$sqlMain = "
		SELECT
			a.*
		FROM ".DB_NMU_EIS."bg_expense a
		WHERE a.i_enable = 1 AND a.i_delete = 2
			AND a.i_level = {$_REQUEST["i_level"]}
		ORDER BY a.c_code_tree;";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		${$root}[] = array(
			"id"		=> "0",
			"c_name"	=> "- เลือกทั้งหมด -"
		);

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["bg_expense_id"]}",
				"c_name"	=> $row["c_code"] . " : " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}
if ($_REQUEST["type"] == "store_year_s") {

	$sqlMain = "
		select i_year from (
			select i_year as i_year from {$DBNAME} bg_budget_hdr_plan
			union all
			select i_year as i_year from {$DBNAME} bg_budget_hdr
			union all
			--select i_year as i_year from {$DBNAME} bg_budget_hdr_overlap
			--union all
			select i_year as i_year from {$DBNAME} bg_budget_hdr_income
			union all
			select i_budget_year as i_year from {$DBNAME} po_working_dtl
			--union all
			--select i_budget_year_overlap as i_year from {$DBNAME} po_working_dtl
		) a
		group by i_year
		order by i_year;";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		// ${$root}[] = array(
		// 	"id"		=> "0",
		// 	"c_name"	=> "- เลือกทั้งหมด -"
		// );

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> $row["i_year"],
				"c_name"	=> $row["i_year"] + 543
			);
			${$root}[] = $temp;
		}
	}
}


echo json_encode(array("debug" => true, $root => ${$root}));
exit;
