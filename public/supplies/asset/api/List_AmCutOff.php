<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;
$DATABASE_NAME = ""; //"NMU_ASSET..";

if ($_REQUEST["type"] == "am_cutoff_hdr") {



	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) {
		$start 	= 0;
	}
	if (!$util->get($limit)) {
		$limit 	= 20;
	} else {
		$limit = ($limit + $start);
	}

	if ($mode == "SEARCH") {
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con .= " AND a.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		}
		if ($_REQUEST["i_budget_year"] > 0) {
			$con .= " AND a.i_year=" . $_REQUEST["i_budget_year"];
		}
	}

	$sqlMain = "
		SET NOCOUNT ON
        SELECT
            ROW_NUMBER() OVER (ORDER BY a.am_cutoff_hdr_id) AS numrow
            ,a.am_cutoff_hdr_id
        INTO #TemData
        FROM {$DATABASE_NAME} am_cutoff_hdr a
        WHERE 1 = 1
            {$con};

        SELECT
            a.numrow
			,b.am_cutoff_hdr_id

			,c_code
			,c_doc
			,i_reason
			,i_success
            ,CONVERT(VARCHAR, b.d_cutoff_date, 120) AS d_cutoff_date
			,c_comment
			,gl_tran_hdr_id 
			
            ,CONVERT(VARCHAR, b.d_create, 120) AS d_create
            ,CONVERT(VARCHAR, b.d_update, 120) AS d_update
        FROM #TemData a
		INNER JOIN {$DATABASE_NAME} am_cutoff_hdr b ON a.am_cutoff_hdr_id = b.am_cutoff_hdr_id
        WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"                => $row["numrow"],
				"id"                =>	$row["am_cutoff_hdr_id"],

				"c_code"			=>	$row["c_code"],
				"c_doc"				=>	$row["c_doc"],
				"i_reason"			=>	$row["i_reason"],
				"i_success"			=>	$row["i_success"],
				"d_cutoff_date"     => ($row["d_cutoff_date"] != "") ? $date->extDateBuddha($row["d_cutoff_date"]) : "",
				"c_comment"			=>	$row["c_comment"],
				"gl_tran_hdr_id"	=>	$row["gl_tran_hdr_id"],

				"d_create"          => ($row["d_create"] != "") ? $date->extDateBuddha($row["d_create"]) : "",
				"d_update"          => ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "am_cutoff_dtl") {

	$sqlMain = "SET NOCOUNT ON
		SELECT 
		ROW_NUMBER() OVER (ORDER BY aa.am_cutoff_hdr_id DESC) AS numrow
		,aa.am_cutoff_hdr_id
		,aa.am_asset_hdr_id
		,aa.c_code --รหัสครุภัณฑ์ A
		,aa.asset_name --ชื่อครุภัณฑ์ B
		,CONVERT(VARCHAR(10),aa.d_receive_date,120) AS receive_date --วันที่รับ C
		,i_period_year --อายุครุภัณฑ์(ปี) W
		,CONVERT(decimal(18,2),aa.f_unit_cost) AS f_unit_cost --มูลค่าเริ่มต้น F
		,CONVERT(decimal(18,2),aa.f_depre) AS f_depre --อมสะสม F
		,CONVERT(decimal(18,2),aa.f_acc_cost) AS f_acc_cost --ราคาตามบัญชี F
	FROM am_cutoff_dtl aa
	WHERE aa.am_cutoff_hdr_id = ?
	ORDER BY aa.d_create DESC";

	$arrParam[]	= $_REQUEST["hdr_id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$no = 0;
	if (sqlsrv_has_rows($stmt)) {
		$f_unit_cost_sum = 0;
		$f_depre = 0;
		$f_acc_cost = 0;
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"no"                        => $row["numrow"],
				"id"                        => ++$no,
				"i_type"                    => 1,
				"am_cutoff_hdr_id"       	=>	$row["am_cutoff_hdr_id"],
				"am_asset_hdr_id"       	=>	$row["am_asset_hdr_id"],
				"c_code"                    =>	$row["c_code"],
				"asset_name"                =>	$row["asset_name"],
				"receive_date"              => ($row["receive_date"] != "") ? $date->extDateBuddha($row["receive_date"]) : "",
				"i_period_year"             =>	$row["i_period_year"],
				"f_unit_cost"               => ($row["f_unit_cost"] != "") ? $row["f_unit_cost"] : "0",
				"f_depre"                   => ($row["f_depre"] != "") ? $row["f_depre"] : "0",
				"f_acc_cost"                => ($row["f_acc_cost"] != "") ? $row["f_acc_cost"] : "0",
			);

			${$root}[] = $temp;

			$f_unit_cost_sum += ($row["f_unit_cost"] != "") ? $row["f_unit_cost"] : 0;
			$f_depre += ($row["f_depre"] != "") ? $row["f_depre"] : 0;
			$f_acc_cost += ($row["f_acc_cost"] != "") ? $row["f_acc_cost"] : 0;
		}

		$temp = array(
			"i_type"                    => 99,
			"f_unit_cost"               => $f_unit_cost_sum,
			"f_depre"               	=> $f_depre,
			"f_acc_cost"               	=> $f_acc_cost,
		);
		array_unshift(${$root}, $temp);
	}

	echo json_encode(array("debug" => true, "totalCount" => $no, $root => ${$root}));
	exit;
}
