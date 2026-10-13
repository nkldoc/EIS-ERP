<?php
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date       = new i_date();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST['type'] == 'dc_cost') {
	if (@$_REQUEST['dc_cost_acc_id']) {
		$con .= " AND a.c_code LIKE (SELECT TOP 1 left(aa.c_code,2) FROM " . DB_CENTER . "dc_cost aa WHERE aa.dc_cost_id= {$_REQUEST["dc_cost_acc_id"]}) + '%'";
	} else {
		if (@$_REQUEST["i_read"] < 4) {
			$con .= " AND a.c_code LIKE (SELECT TOP 1 left(aa.c_code,2) FROM " . DB_CENTER . "dc_cost aa WHERE aa.dc_cost_id= {$_SESSION["dc_cost_id"]}) + '%'";
		}
	}
	// dc_cost
	$sqlMain	= "
		SELECT
			a.*
		FROM " . DB_CENTER . "dc_cost a
		WHERE a.i_last = 1 AND a.i_enable = 1 AND a.i_delete = ?
			{$con}
		ORDER BY c_code";
	$arrParam	= array(DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> $row["dc_cost_id"],
				"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_user") {
	$sqlMain	= "select a.dc_user_id,a.c_full_name from  " . DB_CENTER . "dc_user a 
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
} else if ($_REQUEST["type"] == "dc_cost_sys_main") {

	if (@$_REQUEST["all"] == "all") {
		${$root}[] = array(
			"id"                    => "0",
			"dc_cost_main_id"       => "0",
			"c_name"                => "- เลือกทั้งหมด -",
			"i_main"                => "0",
		);
	}
	if (@$_REQUEST["i_read"] == 1) {
		// $con = " AND a.dc_cost_id = " . $_SESSION["dc_cost_id"];
		$_REQUEST["i_read"] = 3;
	}

	$sql = "
		SET NOCOUNT ON
		DECLARE @TEMP_SP_USER_COST_SYS TABLE (dc_cost_id BIGINT); 
		INSERT INTO @TEMP_SP_USER_COST_SYS EXEC " . DB_CENTER . "SP_USER_COST_SYS "
		. (@$_SESSION["user_id"] ?? "null") . ","
		. (@$_SESSION['i_type_user'] ?? "null") . ","
		. (@$_REQUEST["i_read"] ?? "null") . ","
		. (@$_REQUEST["c_code_sys"] ? "'" . $_REQUEST["c_code_sys"] . "'" : "null") . ";

		select
			dc_cost_id as dc_cost_main_id
			,b.dc_cost_acc_id
			,c_name
			,b.i_main
		from " . DB_CENTER . "dc_cost a 
		inner join (
		select 
			left(c_code,2) + '000000'  as c_code
			,max(b.dc_cost_acc_id) as dc_cost_acc_id
			,case when isnull(max(dc_user_id),0) > 0 then 1 else 0 end as i_main
			-- ,b.dc_cost_acc_id
			-- ,c.dc_user_id
		from @TEMP_SP_USER_COST_SYS a
		inner join " . DB_CENTER . "dc_cost b on a.dc_cost_id = b.dc_cost_id
		left join " . DB_CENTER . "dc_user c on a.dc_cost_id = c.dc_cost_id and dc_user_id = " . (@$_SESSION["user_id"] ?? "null") . "
		where 1=1 {$con}
		group by left(c_code,2) + '000000'
		) b on a.c_code  = b.c_code
    ";

	$arrParam = array();
	$stmt = $db->QueryParam($sql, $arrParam);
	while ($row = $db->Fetch($stmt)) {
		$temp = array(
			"id"                    => $row["dc_cost_acc_id"],
			"dc_cost_main_id"       => $row["dc_cost_main_id"],
			"c_name"                => $row["c_name"],
			"i_main"                => $row["i_main"],
		);
		${$root}[] = $temp;
	}
} else if ($_REQUEST["type"] == "po_creditor_transfer") {
	$sqlMain	= "SELECT * FROM NMU.dbo.po_creditor WHERE i_enable = ? ORDER BY c_name";
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
} else if ($_REQUEST["type"] == "dc_creditor") {
	if (@$_REQUEST["cost_creditor"] == 1) {
		$con .= "\n AND dc_tax_customer_id = 10";
	}
	$sqlMain	= "
		SELECT * 
		FROM  " . DB_NMU . "dc_creditor 
		WHERE i_enable = ? 
			AND i_delete = 2 
			AND i_key = 1
			{$con}";
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
				"id"		=> "{$row["dc_creditor_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_creditor") {
	$sqlMain	= "SELECT * FROM NMU.dbo.po_creditor WHERE i_enable = ? ORDER BY c_name";
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
} else if ($_REQUEST["type"] == "dc_acc") {
	$con = "";
	$join = "";
	$con_bg_expense_id = "";
	if (@$_REQUEST['i_filter_acc'] != "") {
		$con .= " AND c_code LIKE '" . $_REQUEST['i_filter_acc'] . "%'";
	}

	if (@$_REQUEST["bg_expense_id"] > 0) {
		$join = "
			INNER JOIN " . DB_CENTER . " dc_bg_acc_dtl b ON a.dc_acc_id = b.dc_acc_id
			INNER JOIN " . DB_CENTER . " dc_bg_acc_hdr c ON c.dc_bg_acc_hdr_id = b.dc_bg_acc_hdr_id AND c.i_enable = 1 AND c.i_delete = 2
		";
		$con_bg_expense_id = " AND c.bg_expense_id = " . $_REQUEST["bg_expense_id"];
	}

	$sqlMain = "
		SELECT 
			a.dc_acc_id
			,a.c_code
			,a.c_name
		FROM " . DB_CENTER . "dc_acc a
		{$join}
		WHERE a.i_last = 1 
			AND a.i_level = 6 
			AND a.i_enable = 1 
			AND a.i_delete = 2
			{$con}
			{$con_bg_expense_id}
		ORDER BY c_code;";
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
				"id"		=> "{$row["dc_acc_id"]}",
				"c_name"	=> $row["c_code"] . ' : ' . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_expense_budget_type") {

	$sqlMain	= "SELECT * FROM ".DB_CENTER."dc_expense_budget_type WHERE i_enable = ? AND i_delete = 2 AND dc_expense_budget_type_id != 34 ORDER BY c_name";
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
} else if ($_REQUEST["type"] == "bg_expense") {
	$con = '';
	if (@$_REQUEST['mode10']) {
		$con .= " AND LEFT(c_code,2) = '10'";
	}
	$sqlMain	= "SELECT * FROM dbo.bg_expense WHERE i_last = 1 and i_enable = ? {$con} ORDER BY c_code_tree";
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
				"id"					=> "{$row["bg_expense_id"]}",
				"c_name"				=> $row["c_code"] . " : " . $row["c_name"],
				"c_name_excel"			=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "bg_expense_expire") {

	$sqlMain = "
		SELECT
			a.bg_expense_id
			,b.c_code AS c_group_code
			,b.c_name AS c_group_name
			,a.c_code
			,a.c_name
		FROM dbo.bg_expense a
			INNER JOIN bg_expense b ON LEFT(a.c_code_tree,2) = LEFT(b.c_code_tree,2) AND b.i_enable = 1 AND b.i_level = 1
		WHERE a.i_last = 1 AND a.i_delete = 2 AND a.i_enable = ? and isnull(a.i_expire,0) != 1
		ORDER BY a.c_code;";
	$arrParam = array(STATUS_ENABLE);
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
				"id"					=> "{$row["bg_expense_id"]}",
				"c_name"				=> $row["c_code"] . " : " . $row["c_name"],
				"c_name_excel"			=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_emp") {

	$sqlMain	= "SELECT * FROM " . DB_NMU_EIS . "po_emp WHERE i_enable = ? AND i_delete = 2 ORDER BY c_name";
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
				"id"					=> "{$row["po_emp_id"]}",
				"c_name"				=> $row["c_name"],

			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_user_approve") {

	$sqlMain = "
		SELECT * FROM " . DB_CENTER . "dc_user a
			INNER JOIN " . DB_NMU_EIS . "po_user_permission b ON a.dc_user_id = b.dc_user_id AND b.i_approve = 1
		WHERE b.dc_cost_acc_id = ? AND a.i_enable = ? AND a.i_delete = 2 ORDER BY a.c_full_name";
	$arrParam	= array();
	$arrParam[]	= $_REQUEST["dc_cost_acc_id"];
	$arrParam[]	= STATUS_ENABLE;
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
} else if ($_REQUEST["type"] == "dc_user_executive") {

	$sqlMain = "
		SELECT * FROM " . DB_CENTER . "dc_user a
			INNER JOIN " . DB_NMU_EIS . "po_user_permission b ON a.dc_user_id = b.dc_user_id AND b.i_executive = 1
		WHERE b.dc_cost_acc_id = ? AND a.i_enable = ? AND a.i_delete = 2 
		ORDER BY  
			i_executive_main DESC
			,a.c_full_name";
	$arrParam	= array();
	$arrParam[]	= $_REQUEST["dc_cost_acc_id"];
	$arrParam[]	= STATUS_ENABLE;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"i_main"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"					=> "{$row["dc_user_id"]}",
				"i_main"			    => $row["i_executive_main"],
				"c_name"				=> $row["c_full_name"],

			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST['type'] == 'dc_position') {

	$sqlMain = "select dc_position_id 
                    , c_name  
                from " . DB_CENTER . " dc_position
                where isnull(i_enable," . STATUS_DISABLE . ") = ?
                order by c_name
                ";
	$arrParam    = array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = 0;
	while ($row = $db->Fetch($stmt)) {
		$i++;
		$temp = array(
			"id" => $row["dc_position_id"],
			"c_name" => $row["c_name"]
		);
		${$root}[] = $temp;
	}
} else if ($_REQUEST["type"] == "po_paymant_type") {

	$sqlMain	= "SELECT * FROM dbo.po_paymant_type --WHERE i_bulk = 1";
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
				"id"		=> "{$row["po_paymant_type_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_bank") {

	$sqlMain	= "	SELECT * FROM dc_bank WHERE i_enable=? AND i_delete=? ORDER BY c_name;";
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt		= $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_bank_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "booking_store") {
	$con_or = "";

	$dc_cost_acc_id = $db->GetDataBySQL('SELECT TOP 1 dc_cost_acc_id FROM ' . DB_CENTER . 'dc_cost aa WHERE aa.dc_cost_id = ?', array($_REQUEST["dc_cost_id"]));
	if ($dc_cost_acc_id == 75) {
		$con_cost = " AND dc_cost_id IN (SELECT dc_cost_id FROM " . DB_CENTER . "dc_cost aa WHERE aa.dc_cost_acc_id = 75) /* ? */";
	} else {
		$con_cost = " AND a.dc_cost_id =
                    	CASE
                        	WHEN a.i_use_overcost = 1 THEN a.dc_cost_id
                        	ELSE ?
						END
							";
		// $con_cost = " AND dc_cost_id = ?  ";
	}

	if (@$_REQUEST["i_budget_year_overlap"] > 0) {
		$con .= " AND a.i_year = '" . $_REQUEST["i_budget_year_overlap"] . "'\n";
	}
	if (@$_REQUEST["c_booking"] > 0) {
		$con .= " AND a.c_code_ref = '" . $_REQUEST["c_booking"] . "'\n";
	}
	if (@$_REQUEST["in_id"] > 0) {
		$con_or .= " OR c_code_ref = (select top 1 aa.c_booking from po_working_dtl aa where aa.po_working_hdr_id = " . $_REQUEST["in_id"] . ")\n";
	}

	$sqlMain	= "
		SET NOCOUNT ON 
		SELECT 
			b.c_booking 
			,SUM((ISNULL(b.f_total,0) - ISNULL(ret.f_return, 0))) AS f_total
		INTO #tmp_working
		FROM po_working_hdr a
		INNER JOIN po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id 
		LEFT JOIN (SELECT po_working_hdr_id ,SUM(ISNULL(f_return,0)) AS f_return FROM po_return WHERE i_enable = 1 
		GROUP BY po_working_hdr_id) ret ON a.po_working_hdr_id = ret.po_working_hdr_id
		WHERE a.i_enable = 1 AND b.c_booking IS NOT NULL
		GROUP BY b.c_booking;
		
		SELECT  
			bg_budget_dtl_overlap_id
			,i_year
			,c_code_ref
			,dc_expense_budget_type_id
			,dc_cost_id
			,f_overlap
			,f_overlap_reserve
			,f_overlap_reserve_income
			,f_working
			,dc_costTxt
			,bg_expense_id
			,f_overlap - f_overlap_reserve_income - f_overlap_reserve - f_working as f_total
			,d_start_date
			,i_extend_time
			,convert(varchar(10),d_end_date,120) as d_end_date
		FROM (
			SELECT 
				ROW_NUMBER() OVER (ORDER BY i_year DESC, bg_budget_dtl_overlap_id DESC) AS row 
				,* 
			FROM (
				SELECT 
				a.bg_budget_dtl_overlap_id
				,a.c_code_ref
				,a.bg_expense_id
				,a.dc_expense_budget_type_id
				,a.dc_cost_id
				,(SELECT TOP 1 c_name FROM dc_cost aa WHERE aa.dc_cost_id = a.dc_cost_id) AS dc_costTxt
				,b.c_code
				,b.c_name
				,a.f_total AS f_overlap
				,i_year
				,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM vw_bg_reserve_overlap aa WHERE aa.i_reserve = 2 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve
				,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM vw_bg_reserve_overlap aa WHERE aa.i_reserve = 3 AND ISNULL(aa.i_finish,0) = 0 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve_income
				,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM vw_bg_reserve_overlap aa WHERE aa.i_reserve = 3 AND ISNULL(aa.i_finish,0) = 1 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve_finish
				,ISNULL((SELECT TOP 1 aa.f_total FROM #tmp_working aa WHERE aa.c_booking = a.c_code_ref),0) AS f_working
				,a.i_extend_time
				,CASE ISNULL(c.i_extend_time,0) 
					WHEN 0 THEN cast(a.i_year + 0 AS VARCHAR) + '-10-01'
					WHEN 1 THEN cast(a.i_year + 1 AS VARCHAR) + '-04-01'
					WHEN 2 THEN cast(a.i_year + 1 AS VARCHAR) + '-10-01'
					WHEN 3 THEN cast(a.i_year + 2 AS VARCHAR) + '-10-01'
					WHEN 4 THEN cast(a.i_year + 3 AS VARCHAR) + '-10-01'
					ELSE '' 
				END AS d_start_date
				,a.d_end_date
				FROM vw_bg_budget_overlap a
				LEFT JOIN bg_expense b ON a.bg_expense_id = b.bg_expense_id
				LEFT JOIN (
                    SELECT a.c_code ,b.i_extend_time
                    FROM bg_overlap_hdr a
                    INNER JOIN (
                        SELECT bg_overlap_hdr_id, MAX(i_extend_time) AS i_extend_time
                        FROM bg_overlap_hdr_extend
                        WHERE i_enable = 1 AND i_delete = 2
                        GROUP BY bg_overlap_hdr_id
                    ) b ON a.bg_overlap_hdr_id = b.bg_overlap_hdr_id
                ) c on c.c_code = a.c_code_ref
				WHERE
					1 = 1
					AND d_end_date >= ?
					AND a.dc_cost_acc_id = ?
					{$con}
					{$con_cost}
		) a
			
		WHERE  
			(f_overlap - f_overlap_reserve_income - f_overlap_reserve - f_working > 0) 
			{$con_or}
		) a
		DROP TABLE #tmp_working
	";

	$arrParam	= array(date("Y-m-d"), $_REQUEST["dc_cost_acc_id"], $_REQUEST["dc_cost_id"]);
	$stmt		= $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"                            =>	   $row["bg_budget_dtl_overlap_id"],
				"c_booking"                     =>	   $row["c_code_ref"],
				"bg_expense_id"                 =>     $row["bg_expense_id"],
				"dc_expense_budget_type_id"     =>     $row["dc_expense_budget_type_id"],
				"f_total"     					=>     $row["f_total"],
				"i_extend_time"     			=>     $row["i_extend_time"],
				"d_start_date"       		    => 	  ($row["d_start_date"] != "") ? $date->extDateBuddha($row["d_start_date"]) : "",
				"d_end_date"       				=> 	  ($row["d_end_date"] != "") ? $date->extDateBuddha($row["d_end_date"]) : "",
				"i_dont_start"					=>     date("Y-m-d") < $row["d_start_date"] ? 1 : 0,
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "booking_store_pop") {

	$sqlMain	= "
		SET NOCOUNT ON 
		SELECT 
			b.c_booking 
			,SUM((ISNULL(b.f_total,0) - ISNULL(ret.f_return, 0))) AS f_total
		INTO #tmp_working
		FROM po_working_hdr a
		INNER JOIN po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id 
		LEFT JOIN (SELECT po_working_hdr_id ,SUM(f_return) AS f_return FROM po_return WHERE i_enable = 1 
		GROUP BY po_working_hdr_id) ret ON a.po_working_hdr_id = ret.po_working_hdr_id
		WHERE a.i_enable = 1 AND b.c_booking IS NOT NULL
		GROUP BY b.c_booking;
		
		SELECT  
			bg_budget_dtl_overlap_id
			,i_year
			,c_code_ref
			,dc_expense_budget_type_id
			,dc_cost_id
			,f_overlap
			,f_overlap_reserve
			,f_overlap_reserve_income
			,f_working
			,dc_costTxt
			,bg_expense_id
			,a.i_extend_time
			,convert(varchar(10),d_end_date,120) as d_end_date
		FROM (
			SELECT 
				ROW_NUMBER() OVER (ORDER BY i_year DESC, bg_budget_dtl_overlap_id DESC) AS row 
				,* 
			FROM (
				SELECT 
					a.bg_budget_dtl_overlap_id
					,a.c_code_ref
					,a.bg_expense_id
					,a.dc_expense_budget_type_id
					,a.dc_cost_id
					,(SELECT TOP 1 c_name FROM dc_cost aa WHERE aa.dc_cost_id = a.dc_cost_id) AS dc_costTxt
					,b.c_code
					,b.c_name
					,a.f_total AS f_overlap
					,i_year
					,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM vw_bg_reserve_overlap aa WHERE aa.i_reserve = 2 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve
					,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM vw_bg_reserve_overlap aa WHERE aa.i_reserve = 3 AND ISNULL(aa.i_finish,0) = 0 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve_income
					,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM vw_bg_reserve_overlap aa WHERE aa.i_reserve = 3 AND ISNULL(aa.i_finish,0) = 1 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve_finish
					,ISNULL((SELECT TOP 1 aa.f_total FROM #tmp_working aa WHERE aa.c_booking = a.c_code_ref),0) AS f_working
					,a.i_extend_time
					,a.d_end_date
				FROM vw_bg_budget_overlap a
				LEFT JOIN bg_expense b ON a.bg_expense_id = b.bg_expense_id
				WHERE dc_cost_id= ? AND d_end_date >= ? 
		) a
			
		WHERE  f_overlap - f_overlap_reserve_income - f_overlap_reserve - f_working > 0 ) a WHERE a.row > '0' AND a.row <= '20'
		DROP TABLE #tmp_working
	";
	$arrParam	= array($_REQUEST["dc_cost_id"], date("Y-m-d"));
	$stmt		= $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"			=> $row["bg_budget_dtl_overlap_id"],
				"c_booking"	=> $row["c_code_ref"],
				"i_extend_time"	=> $row["i_extend_time"],
				"d_end_date"	=> $row["d_end_date"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
