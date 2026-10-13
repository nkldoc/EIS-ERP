<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;

if ($_REQUEST["type"] == "dc_cost") {
    if (@$_REQUEST['dc_cost_acc_id']) {
        $con .= " AND a.c_code LIKE (SELECT TOP 1 left(aa.c_code,2) FROM " . DB_CENTER . "dc_cost aa WHERE aa.dc_cost_id= {$_REQUEST["dc_cost_acc_id"]}) + '%'";
    }
    if (@$_REQUEST["all"] == "all") {
        ${$root}[] = array(
            "id" => "0",
            "dc_cost_main_id" => "0",
            "c_name" => "- เลือกทั้งหมด -",
            "i_main" => "0",
        );
    }
    // else {
    // 	if (@$_REQUEST["i_read"] < 4) {
    // 		$con .= " AND a.c_code LIKE (SELECT TOP 1 left(aa.c_code,2) FROM " . DB_CENTER . "dc_cost aa WHERE aa.dc_cost_id= {$_SESSION["dc_cost_id"]}) + '%'";
    // 	}
    // }
    $sqlMain = "
		SELECT * FROM " . DB_CENTER . "dc_cost a
		WHERE i_last = 1 AND i_enable = 1 AND i_delete = 2
        {$con}
			--AND c_code_tree LIKE '0104%'
		ORDER BY c_code";
    $arrParam = array(STATUS_ENABLE, 1);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_code" => "",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_cost_id"]}",
                "c_name" => $row["c_code"] . " : " . $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_cost_sys_main") {

    if (@$_REQUEST["i_read"] == 1) {
        // $con = " AND a.dc_cost_id = " . $_SESSION["dc_cost_id"];
        $_REQUEST["i_read"] = 3;
    }
    $sql = "
		SET NOCOUNT ON
		DECLARE @TEMP_SP_USER_COST_SYS TABLE (dc_cost_id BIGINT);
		INSERT INTO @TEMP_SP_USER_COST_SYS EXEC " . DB_CENTER . "SP_USER_COST_SYS "
            . (@$_SESSION["dc_center_user"] ?? "null") . ","
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
		left join " . DB_CENTER . "dc_user c on a.dc_cost_id = c.dc_cost_id and dc_user_id = " . (@$_SESSION["dc_center_user"] ?? "null") . "
		where 1=1 {$con}
		group by left(c_code,2) + '000000'
		) b on a.c_code  = b.c_code
    ";

    $arrParam = array();
    $stmt = $db->QueryParam($sql, $arrParam);
    if (@$_REQUEST["all"] == "all") {
        ${$root}[] = array(
            "id" => "0",
            "dc_cost_main_id" => "0",
            "c_name" => "- เลือกทั้งหมด -",
            "i_main" => "0",
        );
    }
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "id" => $row["dc_cost_acc_id"],
            "dc_cost_main_id" => $row["dc_cost_main_id"],
            "c_name" => $row["c_name"],
            "i_main" => $row["i_main"],
        );
        ${$root}[] = $temp;
    }
} else if ($_REQUEST["type"] == "dc_cost_main") {

    if (@$_REQUEST["all"] == "all") {
        ${$root}[] = array(
            "id" => "0",
            "dc_cost_main_id" => "0",
            "c_name" => "- เลือกทั้งหมด -",
            "i_main" => "0",
        );
    }
    // print_r($_SESSION);
    // exit;
    $con = " AND c.dc_user_id = " . $_SESSION["dc_center_user"];
    if (@$_REQUEST["i_read"] == 1) {
        $_REQUEST["i_read"] = 3;
    }

    $sql = "
		SET NOCOUNT ON
		DECLARE @TEMP_SP_USER_COST_SYS TABLE (dc_cost_id BIGINT);
		INSERT INTO @TEMP_SP_USER_COST_SYS EXEC " . DB_CENTER . "SP_USER_COST_SYS "
            . (@$_SESSION["dc_center_user"] ?? "null") . ","
            . (@$_SESSION['i_type_user'] ?? "null") . ","
            . (@$_REQUEST["i_read"] ?? "null") . ","
            . (@$_REQUEST["c_code_sys"] ? "'" . $_REQUEST["c_code_sys"] . "'" : "null") . ";

		select
			a.dc_cost_id as dc_cost_main_id
			,b.dc_cost_id
			,a.c_code +' : ' + a.c_name as c_name
			,case when isnull(c.dc_user_id,0) > 0 then 1 else 0 end as i_main
		from " . DB_CENTER . "dc_cost a
		inner join @TEMP_SP_USER_COST_SYS b  on a.dc_cost_id = b.dc_cost_id
        inner join " . DB_CENTER . "dc_user_cost_sys cc on a.dc_cost_id = cc.dc_cost_id and dc_user_id = {$_SESSION["dc_center_user"]}
        and c_code_sys = '{$_REQUEST["c_code_sys"]}'
		left join " . DB_CENTER . "dc_user c on a.dc_cost_id = c.dc_cost_id {$con}  ";

    $arrParam = array();
    $stmt = $db->QueryParam($sql, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "id" => intval($row["dc_cost_id"]),
            "dc_cost_main_id" => intval($row["dc_cost_main_id"]),
            "c_name" => $row["c_name"],
            "i_main" => $row["i_main"],
        );
        ${$root}[] = $temp;
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
            AND a.i_group in (1,5)
			{$con}
			{$con_bg_expense_id}
		ORDER BY c_code;";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        $all = false;
        if ($all == "all") {
            ${$root}[] = array(
                "id" => 0,
                "c_name" => "- กรุณาเลือก -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_acc_id"]}",
                "c_name" => $row["c_code"] . ' : ' . $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_bank") {

    $sqlMain = "	SELECT * FROM dc_bank WHERE i_enable=? AND i_delete=? ORDER BY c_name;";
    $arrParam = array(STATUS_ENABLE, DELETE_FALSE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_bank_id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_bank_acc_creditor") {

    $sqlMain = "
            SELECT
                a.dc_bank_acc_creditor_id
                , a.c_code + ' | ' + a.c_name  + ' | ' + b.c_name AS c_name_full
                , a.c_code
                , a.c_name AS c_name_bank_acc
                , b.c_name AS c_name_bank
            FROM " . DB_NMU . "dc_bank_acc_creditor a
            INNER JOIN " . DB_NMU . "dc_bank b ON a.dc_bank_id = b.dc_bank_id
            WHERE
                a.i_enable = 1
                AND a.i_delete = 2
                AND a.dc_creditor_id = ?
            ORDER BY a.i_main DESC";

    $arrParam = array();
    $arrParam[] = @$_REQUEST['dc_creditor_id'] ? $_REQUEST['dc_creditor_id'] : 0;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        $temp = array(
            "id" => 0,
            "c_name_full" => "- ไม่ระบุ -",
            "c_code" => "-",
            "c_name_bank_acc" => "-",
            "c_name_bank" => "-",
        );
        ${$root}[] = $temp;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["dc_bank_acc_creditor_id"],
                "c_name_full" => $row["c_name_full"],
                "c_code" => $row["c_code"],
                "c_name_bank_acc" => $row["c_name_bank_acc"],
                "c_name_bank" => $row["c_name_bank"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_cost2") {
    $sqlMain = "
		SELECT * FROM " . DB_CENTER . "dc_cost
		WHERE i_last = 1 AND i_enable = 1 AND i_delete = 2 and i_last = 1
		ORDER BY c_code";
    $arrParam = array(STATUS_ENABLE, 1);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_code" => "",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_cost_id"]}",
                "c_name" => $row["c_code"] . " : " . $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "bg_budget_year") {
    $sqlMain = "
			SET NOCOUNT ON

        SELECT
            ROW_NUMBER() OVER (ORDER BY a.i_year_ad DESC) AS numrow
            ,a.bg_budget_year_id
        INTO #TemData
        FROM " . DB_NMU_EIS . "bg_budget_year a
        WHERE a.i_enable = 1
            {$con};

        SELECT
            a.numrow
			,b.bg_budget_year_id
			,b.i_year_ad
			,b.i_year_be
			,b.i_status
			,b.i_enable
			,b.c_log_status
        FROM #TemData a
		INNER JOIN " . DB_NMU_EIS . "bg_budget_year b ON a.bg_budget_year_id = b.bg_budget_year_id
        WHERE b.i_status = ? ;
        SELECT COUNT(*) AS rowCounts FROM #TemData;";

    // /******echo sql******/
    // $sql = (@$sqlMain) ? $sqlMain : $sql;
    // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
    // $sql = str_replace('?', '#-#', $sql);
    // foreach ($arr as $fld => $value) {
    //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
    // }
    // echo $sql; exit;
    // /********************/
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if (sqlsrv_has_rows($stmt)) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $row["numrow"],
                "id" => $row["bg_budget_year_id"],
                "i_year_ad" => $row["i_year_ad"],
                "i_year_be" => $row["i_year_be"],
                "i_status" => $row["i_status"],
                "i_enable" => $row["i_enable"],
                "c_log_status" => $row["c_log_status"],
            );

            ${$root}[] = $temp;
        }
    }

    $db->NextResult($stmt);
    $rowCounts = $db->Fetch($stmt);
} else if ($_REQUEST["type"] == "booking_store") {

    if (@$_REQUEST["i_type"]) {
        $limit = $_REQUEST["limit"] ?? null;
        $sort = $_REQUEST["sort"] ?? null;
        $start = $_REQUEST["start"] ?? null;

        $limitShowarr = array($start, $limit);
        $limitShow = " WHERE a.row > ? and a.row <= ? ";
        print_r($limitShowarr);
        exit;
    }

    // $dc_cost_acc_id = $db->GetDataBySQL('SELECT TOP 1 dc_cost_acc_id FROM ' . DB_CENTER . 'dc_cost aa WHERE aa.dc_cost_id = ?', array($_REQUEST["dc_cost_id"]));
    // if ($dc_cost_acc_id == 75) {
    // 	$con_cost = "   AND dc_cost_id IN (SELECT dc_cost_id FROM " . DB_CENTER . "dc_cost aa WHERE aa.dc_cost_acc_id = ?) AND a.i_year = ? /* ? */";
    // } else {
    $con_cost = "   AND dc_cost_id = ? AND a.i_year = ?   ";
    // }

    $sqlMain = "
		SET NOCOUNT ON
		SELECT
			b.c_booking
			,SUM((ISNULL(b.f_total,0) - ISNULL(ret.f_return, 0))) AS f_total
		INTO #tmp_working
		FROM " . DB_NMU_EIS . "po_working_hdr a
		INNER JOIN " . DB_NMU_EIS . "po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
		LEFT JOIN (SELECT po_working_hdr_id ,SUM(ISNULL(f_return,0)) AS f_return FROM " . DB_NMU_EIS . "po_return WHERE i_enable = 1
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
            ,f_overlap - f_overlap_reserve - f_overlap_reserve_income - f_working AS f_total
			,dc_costTxt
			,bg_expense_id
            ,(select c_name from " . DB_NMU_EIS . "bg_expense where bg_expense_id = a.bg_expense_id  ) as bg_expense_name
			,d_end_date FROM (SELECT
			ROW_NUMBER() OVER (ORDER BY i_year DESC, bg_budget_dtl_overlap_id DESC) AS row
			,*
		FROM (
			SELECT
			a.bg_budget_dtl_overlap_id
			,a.c_code_ref
			,a.bg_expense_id
			,a.dc_expense_budget_type_id
			,a.dc_cost_id
			,(SELECT TOP 1 c_name FROM " . DB_CENTER . "dc_cost aa WHERE aa.dc_cost_id = a.dc_cost_id) AS dc_costTxt
			,b.c_code
			,b.c_name
			,a.f_total AS f_overlap
			,i_year
			,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM " . DB_NMU_EIS . "vw_bg_reserve_overlap aa WHERE aa.i_reserve = 2 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve
			,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM " . DB_NMU_EIS . "vw_bg_reserve_overlap aa WHERE aa.i_reserve = 3 AND ISNULL(aa.i_finish,0) = 0 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve_income
			,(SELECT TOP 1  ISNULL(SUM(ISNULL(f_amt,0.00)),0.00)FROM " . DB_NMU_EIS . "vw_bg_reserve_overlap aa WHERE aa.i_reserve = 3 AND ISNULL(aa.i_finish,0) = 1 AND a.c_code_ref = aa.c_code_overlap) AS f_overlap_reserve_finish
			,ISNULL((SELECT TOP 1 aa.f_total FROM #tmp_working aa WHERE aa.c_booking = a.c_code_ref),0) AS f_working
			,a.d_end_date
			FROM " . DB_NMU_EIS . "vw_bg_budget_overlap a
			LEFT JOIN " . DB_NMU_EIS . "bg_expense b ON a.bg_expense_id = b.bg_expense_id
			WHERE
				1 = 1
				AND d_end_date >= ?
				{$con_cost}
		) a

		WHERE  f_overlap - f_overlap_reserve_income - f_overlap_reserve - f_working > 0 ) a
		DROP TABLE #tmp_working
	";

    $arrParam = array(date("Y-m-d"), $_REQUEST["dc_cost_id"], $_REQUEST['i_yyyy_overlap']);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["bg_budget_dtl_overlap_id"],
                "bg_budget_dtl_overlap_id" => $row["bg_budget_dtl_overlap_id"],
                "c_booking" => $row["c_code_ref"],
                "c_name" => $row["c_code_ref"],
                "dc_costTxt" => $row["dc_costTxt"],
                "bg_expense_name" => $row["bg_expense_name"],
                "d_end_date" => $row["d_end_date"],
                "i_year" => intval($row["i_year"]),
                "dc_cost_id" => $row["dc_cost_id"],
                "bg_expense_id" => $row["bg_expense_id"],
                "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                "f_total" => number_format($row["f_total"], 2)
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_cost3") {
    $sqlMain = "
		SELECT * FROM " . DB_CENTER . "dc_cost
		WHERE i_last = 1 AND i_enable = 1 AND i_delete = 2
			AND c_code_tree LIKE '0104%'
		ORDER BY c_code";
    $arrParam = array(STATUS_ENABLE, 1);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_code" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_cost_id"]}",
                "c_name" => $row["c_code"] . " : " . $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_unit_type") {
    $sqlMain = "select dc_unit_type_id,c_code,c_name,f_value,c_comment from " . DB_CENTER . "dc_unit_type WHERE 1=?";
    $arrParam = array(STATUS_ENABLE);
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
                "id" => $row["dc_unit_type_id"],
                "c_name" => $row["c_name"],
                "f_value" => $row["f_value"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "bg_project") {
    $sqlMain = "select bg_budget_item_project_id  as id
	,c_name
	,f_project
	FROM bg_budget_item_project WHERE 1=?";
    $arrParam = array(STATUS_ENABLE);
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
                "id" => $row["id"],
                "c_name" => $row["c_name"] . " วงเงิน(" . number_format($row["f_project"], 2) . ") บาท ",
                "f_project" => $row["f_project"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_user") {
    $sqlMain = "select a.dc_user_id,a.c_full_name from dbo.dc_user a
	inner join dbo.dc_user_menu b on b.dc_user_id=a.dc_user_id
	where b.dc_menu_id =(SELECT dc_menu_id FROM dc_menu where c_filelocation='po-RegPo')
	AND a.i_enable = ?
	group by a.dc_user_id,a.c_full_name
	ORDER BY a.c_full_name";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        $all = true;
        if ($all == "all") {
            ${$root}[] = array(
                "id" => 0,
                "c_name" => "- เลือกผู้ทำรายการ-"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_user_id"]}",
                "c_name" => "{$row["c_full_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_creditor_transfer") {
    $sqlMain = "SELECT * FROM dbo.po_creditor WHERE i_enable = ? ORDER BY c_name";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        $all = false;
        if ($all == "all") {
            ${$root}[] = array(
                "id" => 0,
                "c_name" => "- กรุณาเลือก -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["po_creditor_id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_creditor") {
    $sqlMain = "SELECT * FROM " . DB_NMU . "dc_creditor a WHERE a.i_enable = ? AND a.i_delete = 2 AND a.i_key = 1 ORDER BY c_name";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        $all = false;
        if ($all == "all") {
            ${$root}[] = array(
                "id" => 0,
                "c_name" => "- กรุณาเลือก -"
            );
        }
        if (@$_REQUEST['Repall'] == "Repall") {
            ${$root}[] = array(
                "id" => 0,
                "c_name" => "- เลือกทั้งหมด -"
            );
        }
        // po_creditor_id
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_creditor_id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_creditor") {
    $sqlMain = "SELECT * FROM " . DB_NMU_EIS . "po_creditor WHERE i_enable = ? ORDER BY c_name";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        $all = false;
        if ($all == "all") {
            ${$root}[] = array(
                "id" => 0,
                "c_name" => "- กรุณาเลือก -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["po_creditor_id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_expense_budget_type") {
    $budget_type = "";
    if (@$_REQUEST["c_dc_expense_budget_type_id"] > 0) {
        $budget_type = " and a.dc_expense_budget_type_id = " . $_REQUEST["c_dc_expense_budget_type_id"];
    }
    if (@$_REQUEST["c_dc_expense_budget_type2_id"] > 0) {
        $budget_type = " and a.dc_expense_budget_type_id in (" . $_REQUEST["c_dc_expense_budget_type_id"] . "," . $_REQUEST["c_dc_expense_budget_type2_id"] . ")";
    }
    if (@$_REQUEST["c_dc_expense_budget_type3_id"] > 0) {
        $budget_type = " and a.dc_expense_budget_type_id in (" . $_REQUEST["c_dc_expense_budget_type_id"] . "," . $_REQUEST["c_dc_expense_budget_type2_id"] . "," . $_REQUEST["c_dc_expense_budget_type3_id"] . ")";
    }

    $sqlMain = "SELECT a.dc_expense_budget_type_id,a.c_name ,isnull(a.i_bg_type,0) as i_bg_type "
            . "FROM " . DB_CENTER . "dc_expense_budget_type a "
            . "WHERE a.i_enable = ? AND a.i_delete = 2  and dc_expense_budget_type_id != 34"
            . $budget_type
            . "ORDER BY a.c_name";
    $arrParam = array(STATUS_ENABLE);
    $bgType = array(0 => "เงินรายทั่วไป", 1 => "เงินงวด");
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "i_bg_type" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_expense_budget_type_id"]}",
                "i_bg_type" => $row["i_bg_type"],
                "c_bg_type" => $bgType[$row["i_bg_type"]], //"{$row["i_bg_type"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_expense_budget_type_cost") {
    if (@$_REQUEST['dc_cost_acc_id']) {
        $sql = "
		SET NOCOUNT ON
		DECLARE  @TEMP_SP_COST_TO_BG_TYPE TABLE (dc_expense_budget_type_id BIGINT);
		INSERT INTO @TEMP_SP_COST_TO_BG_TYPE EXEC " . DB_CENTER . "SP_COST_TO_BG_TYPE ?;
		SELECT ISNULL(STRING_AGG(CAST(dc_expense_budget_type_id AS VARCHAR), ','),0) FROM @TEMP_SP_COST_TO_BG_TYPE;
		";
        $comma = $db->GetDataBySQL($sql, array($_REQUEST['dc_cost_acc_id']));
        $con .= " AND a.dc_expense_budget_type_id in (" . $comma . ")";
    } else {
        if ($_REQUEST["i_read"] < 4) {
            $sql = "
				SET NOCOUNT ON
				DECLARE @dc_cost_id_s VARCHAR(max) = '';
				DECLARE @TEMP_SP_USER_COST_SYS TABLE (dc_cost_id BIGINT);
				INSERT INTO @TEMP_SP_USER_COST_SYS EXEC " . DB_CENTER . "SP_USER_COST_SYS "
                    . (@$_SESSION["dc_center_user"] ?? "null") . ","
                    . (@$_SESSION['i_type_user'] ?? "null") . ","
                    . (@$_REQUEST["i_read"] ?? "null") . ","
                    . (@$_REQUEST["c_code_sys"] ? "'" . $_REQUEST["c_code_sys"] . "'" : "null") . ";

				DECLARE  @TEMP_SP_COST_TO_BG_TYPE TABLE (dc_expense_budget_type_id BIGINT);
				SELECT @dc_cost_id_s = STRING_AGG(CAST(dc_cost_id AS VARCHAR), ',') FROM @TEMP_SP_USER_COST_SYS;
				INSERT INTO @TEMP_SP_COST_TO_BG_TYPE EXEC " . DB_CENTER . "SP_COST_TO_BG_TYPE @dc_cost_id_s;
				SELECT ISNULL(STRING_AGG(CAST(dc_expense_budget_type_id AS VARCHAR), ','),0) FROM @TEMP_SP_COST_TO_BG_TYPE;
			";
            $comma = $db->GetDataBySQL($sql, array($_SESSION["dc_cost_id"]));
            $con .= " AND a.dc_expense_budget_type_id in (" . $comma . ")";
        }
    }

    $sqlMain = "
		SET NOCOUNT ON
		SELECT a.*
		FROM  " . DB_CENTER . "dc_expense_budget_type a
		WHERE i_enable = ?
			{$con}
		ORDER BY c_name
	";
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
                "id" => "{$row["dc_expense_budget_type_id"]}",
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_expense_budget_type2") {

    $sqlMain = "SELECT * "
            . "FROM " . DB_CENTER . "dc_expense_budget_type "
            . "WHERE i_enable = ? AND i_delete = 2 ORDER BY c_name";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {


        ${$root}[] = array(
            "id" => "0",
            "c_name" => "- ไม่เลือก -"
        );

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_expense_budget_type_id"]}",
                "i_bg_type" => $row["i_bg_type"],
                "c_name" => "{$row["c_name"]}"
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_expense") {
    $po_expense = "";
    if (@$_REQUEST["po_expense_id"] > 0) {
        $po_expense = " and bg_expense_id = " . $_REQUEST["po_expense_id"];
    }
    $sqlMain = "SELECT * FROM " . DB_NMU_EIS . "bg_expense WHERE i_enable = ? AND i_level = 4  {$po_expense} ORDER BY c_code";
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
                "id" => "{$row["bg_expense_id"]}",
                "c_name" => $row["c_code"] . " : " . $row["c_name"],
                "c_name_excel" => $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_expense_expire") {
    $po_expense = "";
    if (@$_REQUEST["po_expense_id"] > 0) {
        $po_expense = " and bg_expense_id = " . $_REQUEST["po_expense_id"];
    }
    $sqlMain = "SELECT * FROM " . DB_NMU_EIS . "bg_expense WHERE i_enable = ? and isnull(i_expire,0) != 1 AND i_level = 4  {$po_expense} ORDER BY c_code";
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
                "id" => "{$row["bg_expense_id"]}",
                "c_name" => $row["c_code"] . " : " . $row["c_name"],
                "c_name_excel" => $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_emp") {

    $sqlMain = "SELECT * FROM " . DB_NMU_EIS . " po_emp WHERE i_enable = ? AND i_delete = 2 ORDER BY c_name";
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
} else if ($_REQUEST["type"] == "sp_emp") {

    $sqlMain = "SELECT * FROM dbo.sp_emp WHERE i_enable = ? and  dc_department_id > 0   ORDER BY c_name";
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
                "id" => "{$row["sp_emp_id"]}",
                "c_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "tor_status_id") {

    $sqlMain = "SELECT * FROM dbo.sp_status_hdr WHERE i_enabled = ?   ORDER BY c_name";
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
                "id" => "{$row["sp_status_hdr_id"]}",
                "c_code_name" => $row["c_code"] . " : " . $row["c_name"],
                "c_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_department") {

    $sqlMain = "SELECT * FROM dbo.sp_department WHERE i_seq = ?  ORDER BY c_name";
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
                "id" => "{$row["dc_department_id"]}",
                "c_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "sp_tor_victory") {

    $sqlMain = "SELECT * FROM dbo.sp_tor_victory WHERE sp_tor_id = ? and i_enabled = ? ORDER BY c_name";
    $arrParam = array($_REQUEST["id"], STATUS_ENABLE);
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
                "id" => "{$row["dc_creditor_id"]}",
                "dc_creditor_id" => "{$row["dc_creditor_id"]}",
                "sp_tor_id" => "{$row["sp_tor_id"]}",
                "c_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_user_permission") {

    $sqlMain = "
		SELECT * FROM dbo.dc_user a
			INNER JOIN dbo.po_user_permission b ON a.dc_user_id = b.dc_user_id AND b.i_approve = 1
		WHERE a.i_enable = ? AND a.i_delete = 2 ORDER BY a.c_full_name";
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
                "id" => "{$row["dc_user_id"]}",
                "c_name" => $row["c_full_name"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_creditor_st0007") {
    if ($_REQUEST["mode"] == "EDIT") {
        $con = 'OR a.dc_creditor_id =' . $_REQUEST["dc_creditor_id"];
    }

    $sqlMain = "
	 SET NOCOUNT ON
	 select a.dc_creditor_id, a.c_name
	 FROM {$DB_NMU}dc_creditor a
	 full join sp_tor_victory b on a.dc_creditor_id = b.dc_creditor_id and b.sp_tor_id = ?
	 where (a.i_enable = 1 and i_enable =1 and b.dc_creditor_id is null) {$con}
	 order by a.c_name";
    $arrParam = array($_REQUEST["tor_id"]);
    // echo $sqlMain .'/*'; print_r($arrParam); echo '*/'; exit;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_creditor_id"]}",
                "c_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "i_sys") {
    // New handler for System List
    // Assuming table name 'sys_system' and column 'group_code' based on the SQL provided.
    // If user didn't run the SQL or doesn't have 'group_code', this might need adjustment.
    // But per plan, we assume columns: id, system_code, c_name, group_code.

    $sqlMain = "SELECT * FROM sys_system WHERE i_enable = 1 ORDER BY group_code, sys_system_id";
    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);

    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["sys_system_id"],
                "system_code" => $row["system_code"],
                "c_name" => $row["c_name"],
                "group_code" => $row["group_code"] // Important for filtering in JS
            );
            ${$root}[] = $temp;
        }
    }
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
