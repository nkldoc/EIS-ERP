<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;

if ($_REQUEST["type"] == "po_user_permission") {

    $sqlMain = "
		SELECT a.* FROM " . DB_CENTER . "dc_user a
			INNER JOIN dbo.po_user_permission b ON a.dc_user_id = b.dc_user_id AND b.i_approve = 1
		WHERE a.i_delete = 2 AND a.i_enable = ?
		ORDER BY a.c_full_name";
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
                "c_name" => $row["c_full_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_tax_customer") {

    $sqlMain = "
		SELECT
			a.dc_tax_customer_id
			,a.c_name
			,a.i_is_type
			,a.i_dec_person
			,a.i_type_tax

			,b.dc_tax_income_id
			,b.c_name as c_name_tax_income
		FROM " . DB_CENTER . "dc_tax_customer a
		LEFT JOIN " . DB_CENTER . "dc_tax_income b ON a.dc_tax_income_id = b.dc_tax_income_id
		WHERE
			a.i_enable = 1
			AND a.i_delete = 2";

    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["dc_tax_customer_id"],
                "c_name" => $row["c_name"],
                "i_is_type" => $row["i_is_type"],
                "i_dec_person" => $row["i_dec_person"],
                "i_type_tax" => $row["i_type_tax"],
                "dc_tax_income_id" => $row["dc_tax_income_id"],
                "c_name_tax_income" => $row["c_name_tax_income"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "CREDITOR_TAXDATA") {

    $sqlMain = "
		select top 1
			dc_creditor_id
			,isnull(a.c_tax_number_imp,'') as c_tax_number_imp
			,a.dc_tax_customer_id
			,isnull((select top 1 c_name from " . DB_CENTER . "dc_tax_customer aa where aa.dc_tax_customer_id = a.dc_tax_customer_id),'') as c_name_tax_customer
			,isnull((select top 1 (select top 1 c_name from " . DB_CENTER . "dc_tax_income aaa where aaa.dc_tax_income_id = aa.dc_tax_income_id) from  " . DB_CENTER . "dc_tax_customer aa where aa.dc_tax_customer_id = a.dc_tax_customer_id),'')as c_name_tax_income
			,isnull(a.tax_c_title,'') as tax_c_title
			,isnull(a.tax_c_name,'') as tax_c_name
			,isnull(a.tax_c_middle_name,'') as tax_c_middle_name
			,isnull(a.tax_c_last_name,'') as tax_c_last_name
			,isnull(a.tax_c_branch,'') as tax_c_branch
			,isnull(a.tax_c_bldg,'') as tax_c_bldg
			,isnull(a.tax_c_room_no,'') as tax_c_room_no
			,isnull(a.tax_c_floor,'') as tax_c_floor
			,isnull(a.tax_c_village,'') as tax_c_village
			,isnull(a.tax_c_house_no,'') as tax_c_house_no
			,isnull(a.tax_c_village_no,'') as tax_c_village_no
			,isnull(a.tax_c_lane,'') as tax_c_lane
			,isnull(a.tax_c_road,'') as tax_c_road
			,isnull(a.tax_c_province,'') as tax_c_province
			,isnull(a.tax_c_district,'') as tax_c_district
			,isnull(a.tax_c_tambon,'') as tax_c_tambon
			,isnull(a.tax_c_post_code,'') as tax_c_post_code
			,isnull(a.dc_tambon_id,'') as dc_tambon_id
			,isnull(a.c_email,'') as c_email
			,isnull(a.c_tele_imp,'') as c_tele_imp

			,b.dc_tambon_id
			,b.dc_district_id
			,b.dc_province_id
			,b.c_post_code_all
		from " . DB_NMU . "dc_creditor a
		left join " . DB_CENTER . "dc_tambon b on a.dc_tambon_id = b.dc_tambon_id
		where dc_creditor_id  = ?";

    $arrParam = array();
    $arrParam[] = $_REQUEST["dc_creditor_id"];

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["dc_creditor_id"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "c_name_tax_customer" => $row["c_name_tax_customer"],
                "c_name_tax_income" => $row["c_name_tax_income"],
                "dc_tax_customer_id" => $row["dc_tax_customer_id"],
                "tax_c_title" => $row["tax_c_title"],
                "tax_c_name" => $row["tax_c_name"],
                "tax_c_middle_name" => $row["tax_c_middle_name"],
                "tax_c_last_name" => $row["tax_c_last_name"],
                "tax_c_branch" => $row["tax_c_branch"],
                "tax_c_bldg" => $row["tax_c_bldg"],
                "tax_c_room_no" => $row["tax_c_room_no"],
                "tax_c_floor" => $row["tax_c_floor"],
                "tax_c_village" => $row["tax_c_village"],
                "tax_c_house_no" => $row["tax_c_house_no"],
                "tax_c_village_no" => $row["tax_c_village_no"],
                "tax_c_lane" => $row["tax_c_lane"],
                "tax_c_road" => $row["tax_c_road"],
                "tax_c_province" => $row["tax_c_province"],
                "tax_c_district" => $row["tax_c_district"],
                "tax_c_tambon" => $row["tax_c_tambon"],
                "tax_c_post_code" => $row["tax_c_post_code"],
                "dc_tambon_id" => $row["dc_tambon_id"],
                "c_email" => $row["c_email"],
                "c_tele_imp" => $row["c_tele_imp"],
                "dc_tambon_id" => $row["dc_tambon_id"],
                "dc_district_id" => $row["dc_district_id"],
                "dc_province_id" => $row["dc_province_id"],
                "c_post_code_all" => $row["c_post_code_all"],
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
} else if ($_REQUEST["type"] == "dc_province") {

    $sqlMain = "
		SELECT
			dc_province_id
			,c_province_thai
		FROM " . DB_CENTER . "dc_province
		WHERE
			i_enable = 1
			AND i_delete = 2
		ORDER BY dc_province_id";

    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["dc_province_id"],
                "c_name" => $row["c_province_thai"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_district") {
    $con = @$_REQUEST["dc_province_id"] > 0 ? " AND dc_province_id =" . $_REQUEST["dc_province_id"] : "";

    $sqlMain = "
		SELECT
			dc_district_id
			,c_district_thai_short
		FROM " . DB_CENTER . "dc_district
		WHERE
			i_enable = 1
			AND i_delete = 2
			{$con}
		ORDER BY dc_district_id";

    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["dc_district_id"],
                "c_name" => $row["c_district_thai_short"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_tambon") {
    $con = @$_REQUEST["dc_district_id"] > 0 ? " AND dc_district_id =" . $_REQUEST["dc_district_id"] : "";

    $sqlMain = "
		SELECT
			dc_tambon_id
			,c_tambon_thai_short
			,c_post_code_all
		FROM " . DB_CENTER . "dc_tambon
		WHERE
			i_enable = 1
			AND i_delete = 2
			{$con}
		ORDER BY dc_tambon_id";

    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["dc_tambon_id"],
                "c_name" => $row["c_tambon_thai_short"],
                "c_post_code_all" => $row["c_post_code_all"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_title") {

    $sqlMain = "
		SELECT
			dc_title_id
			,c_name
		FROM " . DB_CENTER . "dc_title
		WHERE
			i_enable = 1
			AND i_delete = 2
			AND dc_title_id != 1
		ORDER BY dc_title_id";

    $arrParam = array();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["dc_title_id"],
                "c_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_parcel_officer") {

    $sqlMain = "
		SELECT *
			FROM dbo.po_parcel_officer
		WHERE i_delete = 2 AND i_enable = ?
		ORDER BY c_name";
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
                "id" => "{$row["po_parcel_officer_id"]}",
                "c_name" => $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_reason_protest") {

    $sqlMain = "
		SELECT *
			FROM dbo.po_reason_protest
		WHERE i_delete = 2 AND i_enable = ?
		ORDER BY i_row";
    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "i_row" => "0",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["po_reason_protest_id"]}",
                "i_row" => "{$row["i_row"]}",
                "c_name" => "ข้อ " . $row["i_row"] . " : " . $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "bg_expense") {
    $sql_have = "";
    $con_i_have = @$_REQUEST["i_have"] ? "" : "--";

    if (@$_REQUEST["i_have"] == 1) {
        $con_ = "";
        $con_group_ = "";

        $i_budget_year = $_REQUEST["i_budget_year"];
        $con_ .= " AND dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"] . "\n";
        $con_ .= " AND dc_cost_acc_id = " . $_REQUEST["dc_cost_acc_id"] . "\n";
        if ($_REQUEST["dc_cost_acc_id"] == 77) {
            $cost_identity = array();
            if ($_REQUEST["i_working_type"] != 1) {
                /*                 * *************SQL cost_identity ******************
                  select b.dc_cost_id, b.c_name from (
                  select b.dc_cost_id
                  from bg_budget_hdr_plan  a
                  inner join bg_budget_dtl_plan b on a.bg_budget_hdr_plan_id = b.bg_budget_hdr_plan_id
                  where a.i_year = 2024
                  group by b.dc_cost_id
                  )a
                  INNER join NMU_DATACENTER..dc_cost b on a.dc_cost_id = b.dc_cost_id
                  where dc_cost_acc_id = 77
                 * ************************************************* */

                $cost_identity = array(
                    36, // ฝ่ายการคลัง
                    38, // ฝ่ายพัสดุ
                    82, // งานเวชภัณฑ์ทางการแพทย์
                    50, // ฝ่ายเภสัชกรรม
                    81, // ฝ่ายบริหารงานก่อสร้างบำรุงรักษาอาคารฯ
                        // 37, // ฝ่ายการศึกษาและกิจการนักศึกษา
                        // 41, // ฝ่ายวิชาการ
                        // 43, // ฝ่ายส่งเสริมการวิจัย
                        // 46, // สำนักงานผู้อำนวยการ
                        // 47, // ฝ่ายการพยาบาล
                        // 48, // ฝ่ายชันสูตรโรคกลางและธนาคารเลือด
                        // 77, // คณะแพทยศาสตร์วชิรพยาบาล
                );
            }
            if (in_array($_REQUEST["dc_cost_id"], $cost_identity)) {
                $con_ .= " AND dc_cost_id = " . $_REQUEST["dc_cost_id"] . "\n";
            } else {
                $con_ .= " AND dc_cost_id = 77\n";
            }
            $con_group_ .= ",dc_cost_id";
        }

        $sql_have = "
			DECLARE @TEMP_SP_BG_BUDGET_SUM TABLE (
				i_year bigint
				,dc_expense_budget_type_id bigint
				,dc_cost_acc_id bigint
				,dc_cost_id bigint
				,bg_expense_id bigint
				,f_plan_begin decimal(18,2)
				,f_period_begin decimal(18,2)
				,f_income_begin decimal(18,2)
				,f_plan_transfer decimal(18,2)
				,f_period_transfer decimal(18,2)
				,f_income_transfer decimal(18,2)
				,f_reserve_budget decimal(18,2)
				,f_reserve_budget_long decimal(18,2)
				,f_reserve_budget_income decimal(18,2)
				,f_reserve_budget_income_Finish decimal(18,2)
				,f_reserve_period decimal(18,2)
				,f_reserve_periodincome decimal(18,2)
				,f_reserve_periodfinish decimal(18,2)
				,f_reserve_income decimal(18,2)
				,f_reserve_income_Finish decimal(18,2)
				,f_total_all decimal(18,2)
				,f_return_all decimal(18,2)
				,f_total_cut decimal(18,2)
				,f_return_cut decimal(18,2)
				,f_total_pay decimal(18,2)
				,f_return_pay decimal(18,2)
				,f_plan_total decimal(18,2)
				,f_plan_cut_total decimal(18,2)
				,f_plan_pay_total decimal(18,2)
				,f_period_total decimal(18,2)
				,f_period_cut_total decimal(18,2)
				,f_period_pay_total decimal(18,2)
				,f_income_total decimal(18,2)
				,f_income_cut_total decimal(18,2)
				,f_income_pay_total decimal(18,2)
			);
			INSERT INTO @TEMP_SP_BG_BUDGET_SUM EXEC SP_BG_BUDGET_SUM {$i_budget_year}

			SELECT
				bg_expense_id
				,dc_cost_acc_id
				,SUM(ISNULL(f_income_total,0)) AS f_income_total
			into #temp
			FROM @TEMP_SP_BG_BUDGET_SUM
			WHERE 1 = 1
				AND f_income_total > 0
				{$con_}
			GROUP BY
				bg_expense_id
				,dc_cost_acc_id
				{$con_group_}";
    }


    $sqlMain = "
		SET NOCOUNT ON
		{$sql_have}
		SELECT
			a.bg_expense_id
			,a.c_code
			,a.c_name
		FROM bg_expense a
		{$con_i_have}INNER JOIN #temp b ON a.bg_expense_id = b.bg_expense_id
		WHERE a.i_enable = 1 AND i_delete = 2 and a.i_last = 1
		ORDER BY a.c_code
	";

    $arrParam = array();
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
                "c_name" => $row["c_code"] . " : " . $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "bg_expense_pop") {
    $sql_have = "";
    $con = "";
    $con_i_have = @$_REQUEST["i_have"] ? "" : "--";

    if (@$_REQUEST["i_have"] == 1) {
        $con_ = "";
        $con_group_ = "";

        $i_budget_year = $_REQUEST["i_budget_year"];
        $con_ .= " AND dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"] . "\n";
        $con_ .= " AND dc_cost_acc_id = " . $_REQUEST["dc_cost_acc_id"] . "\n";
        if ($_REQUEST["dc_cost_acc_id"] == 77) {
            $cost_identity = array();
            if ($_REQUEST["i_working_type"] != 1) {
                /*                 * *************SQL cost_identity ******************
                  select b.dc_cost_id, b.c_name from (
                  select b.dc_cost_id
                  from bg_budget_hdr_plan  a
                  inner join bg_budget_dtl_plan b on a.bg_budget_hdr_plan_id = b.bg_budget_hdr_plan_id
                  where a.i_year = 2024
                  group by b.dc_cost_id
                  )a
                  INNER join NMU_DATACENTER..dc_cost b on a.dc_cost_id = b.dc_cost_id
                  where dc_cost_acc_id = 77
                 * ************************************************* */

                $cost_identity = array(
                    36, // ฝ่ายการคลัง
                    38, // ฝ่ายพัสดุ
                    82, // งานเวชภัณฑ์ทางการแพทย์
                    50, // ฝ่ายเภสัชกรรม
                    81, // ฝ่ายบริหารงานก่อสร้างบำรุงรักษาอาคารฯ
                        // 37, // ฝ่ายการศึกษาและกิจการนักศึกษา
                        // 41, // ฝ่ายวิชาการ
                        // 43, // ฝ่ายส่งเสริมการวิจัย
                        // 46, // สำนักงานผู้อำนวยการ
                        // 47, // ฝ่ายการพยาบาล
                        // 48, // ฝ่ายชันสูตรโรคกลางและธนาคารเลือด
                        // 77, // คณะแพทยศาสตร์วชิรพยาบาล
                );
            }
            if (in_array($_REQUEST["dc_cost_id"], $cost_identity)) {
                $con_ .= " AND dc_cost_id = " . $_REQUEST["dc_cost_id"] . "\n";
            } else {
                $con_ .= " AND dc_cost_id = 77\n";
            }
            $con_group_ .= ",dc_cost_id";
        }

        $mode = @$_REQUEST["mode"];
        $i_read = @$_REQUEST["i_read"];

        $limit = @$_REQUEST["limit"];
        $start = @$_REQUEST["start"];

        if (!$util->get($start)) {
            $start = 0;
        }
        if (!$util->get($limit)) {
            $limit = 20;
        } else {
            $limit = ($limit + $start);
        }
        $con_page = " AND temp.numrow > ? AND temp.numrow <= ?";

        if ($mode == "SEARCH") {
            if ($_REQUEST["filter"] == "c_code") {
                $con .= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
            } else if ($_REQUEST["filter"] == "c_name") {
                $con .= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
            }
        }
        $con_or = "";
        if (@$_REQUEST["id"] > 0) {
            $con_or .= " OR a.bg_overlap_hdr_extend_group_id = " . $_REQUEST["id"];
        }

        $sql_have = "
			DECLARE @TEMP_SP_BG_BUDGET_SUM TABLE (
				i_year bigint
				,dc_expense_budget_type_id bigint
				,dc_cost_acc_id bigint
				,dc_cost_id bigint
				,bg_expense_id bigint
				,f_plan_begin decimal(18,2)
				,f_period_begin decimal(18,2)
				,f_income_begin decimal(18,2)
				,f_plan_transfer decimal(18,2)
				,f_period_transfer decimal(18,2)
				,f_income_transfer decimal(18,2)
				,f_reserve_budget decimal(18,2)
				,f_reserve_budget_long decimal(18,2)
				,f_reserve_budget_income decimal(18,2)
				,f_reserve_budget_income_Finish decimal(18,2)
				,f_reserve_period decimal(18,2)
				,f_reserve_periodincome decimal(18,2)
				,f_reserve_periodfinish decimal(18,2)
				,f_reserve_income decimal(18,2)
				,f_reserve_income_Finish decimal(18,2)
				,f_total_all decimal(18,2)
				,f_return_all decimal(18,2)
				,f_total_cut decimal(18,2)
				,f_return_cut decimal(18,2)
				,f_total_pay decimal(18,2)
				,f_return_pay decimal(18,2)
				,f_plan_total decimal(18,2)
				,f_plan_cut_total decimal(18,2)
				,f_plan_pay_total decimal(18,2)
				,f_period_total decimal(18,2)
				,f_period_cut_total decimal(18,2)
				,f_period_pay_total decimal(18,2)
				,f_income_total decimal(18,2)
				,f_income_cut_total decimal(18,2)
				,f_income_pay_total decimal(18,2)
			);
			INSERT INTO @TEMP_SP_BG_BUDGET_SUM EXEC SP_BG_BUDGET_SUM {$i_budget_year}

			SELECT
				bg_expense_id
				,dc_cost_acc_id
				,SUM(ISNULL(f_plan_begin,0) - ISNULL(f_plan_transfer,0)) AS f_plan
				,SUM(ISNULL(f_income_begin,0) - ISNULL(f_income_transfer,0)) AS f_income
				,SUM(ISNULL(f_income_begin,0) - ISNULL(f_income_transfer,0) - ISNULL(f_income_total,0)) AS f_income_all
				,SUM(ISNULL(f_income_total,0)) AS f_income_total
			into #temp
			FROM @TEMP_SP_BG_BUDGET_SUM
			WHERE 1 = 1
				AND f_income_total > -1
				{$con_}
			GROUP BY
				bg_expense_id
				,dc_cost_acc_id
				{$con_group_}";
    }


    $sqlMain = "
		SET NOCOUNT ON
		{$sql_have}
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.c_code) AS numrow
			,a.bg_expense_id
			,a.c_code
			,a.c_name
			,b.f_plan
			,b.f_income
			,b.f_income_all
			,b.f_income_total
		into #TemData
		FROM bg_expense a
		{$con_i_have}INNER JOIN #temp b ON a.bg_expense_id = b.bg_expense_id
		WHERE a.i_enable = 1 AND i_delete = 2 {$con}

		select *
		from #TemData a
		where 1 = 1
			AND a.numrow > ? AND a.numrow <= ?
		ORDER BY a.numrow

		SELECT COUNT(*) AS rowCounts FROM #TemData;
	";

    $arrParam = array();
    $arrParam[] = $start;
    $arrParam[] = $limit;

    if (@$_REQUEST["show_sql"]) {
        /*         * ****echo sql***** */
        $sql = str_replace('?', '#-#', $sqlMain);
        foreach ($arrParam as $fld => $value) {
            $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        }
        echo $sql;
        exit;
        /*         * ***************** */
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => $row["numrow"],
            "id" => $row["bg_expense_id"],
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"],
            "f_plan" => $row["f_plan"],
            "f_income" => $row["f_income"],
            "f_income_all" => $row["f_income_all"],
            "f_income_total" => $row["f_income_total"],
        );
        ${$root}[] = $temp;
    }

    $db->NextResult($stmt);
    $rowCounts = $db->Fetch($stmt);
    echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
} else if ($_REQUEST["type"] == "sp_sbill_pop") {
    $mode = @$_REQUEST["mode"];
    $i_read = @$_REQUEST["i_read"];

    $limit = @$_REQUEST["limit"];
    $start = @$_REQUEST["start"];

    if (!$util->get($start)) {
        $start = 0;
    }
    if (!$util->get($limit)) {
        $limit = 20;
    } else {
        $limit = ($limit + $start);
    }

    $con = "";
    if ($mode == "SEARCH") {
        if ($_REQUEST["filter"] == "c_contract_code") {
            $con .= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%'\n";
        }
    }

    if (@$_REQUEST["sp_sbill_hdr_id"]) {
        $con .= " AND ISNULL(a.sp_sbill_hdr_id,0) = " . $_REQUEST["sp_sbill_hdr_id"] . "\n";
    } else {
        $con .= " AND ISNULL(b.po_working_hdr_id,0) = 0\n";
    }

    if (@$_REQUEST["dc_cost_id"]) {
        $con .= " AND a.dc_cost_id = " . $_REQUEST["dc_cost_id"] . "\n";
    }

    $sqlMain = "
		SET NOCOUNT ON

		SELECT
			ROW_NUMBER() OVER (ORDER BY c_contract_code) AS numrow
			,sp_sbill_hdr_id
			,c_contract_code
			,c_doc_result_ref
			,COUNT(*) as count
			,SUM(isnull(a.f_period_amt,0)) as f_sum
		INTO #TemData
		FROM " . DB_NMU_ERP . "sp_sbill_items a
		LEFT JOIN po_working_hdr b ON a.po_hdr_id = b.po_working_hdr_id AND i_enable = 1
		WHERE
			i_enabled = 1
			{$con}
		GROUP BY sp_sbill_hdr_id
			,c_contract_code
			,c_doc_result_ref

		SELECT *
		FROM #TemData a
		WHERE 1 = 1
			AND a.numrow > ? AND a.numrow <= ?
		ORDER BY a.numrow

		SELECT COUNT(*) AS rowCounts FROM #TemData;
	";

    $arrParam = array();
    $arrParam[] = $start;
    $arrParam[] = $limit;

    if (@$_REQUEST["show_sql"]) {
        /*         * ****echo sql***** */
        $sql = str_replace('?', '#-#', $sqlMain);
        foreach ($arrParam as $fld => $value) {
            $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        }
        echo $sql;
        exit;
        /*         * ***************** */
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => $row["numrow"],
            "id" => $row["sp_sbill_hdr_id"],
            "c_contract_code" => $row["c_contract_code"],
            "c_doc_result_ref" => $row["c_doc_result_ref"],
            "count" => $row["count"],
            "f_sum" => $row["f_sum"],
        );
        ${$root}[] = $temp;
    }

    $db->NextResult($stmt);
    $rowCounts = $db->Fetch($stmt);
    echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
} else if ($_REQUEST["type"] == "sp_sbill_pop_item") {

    $con = "";

    $sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY c_contract_code) AS numrow
			,sp_sbill_hdr_id
			,a.c_doc_result_ref
			,a.c_doc_ref
			,convert(varchar(10),a.d_doc_date,120) as d_doc_date
			,a.f_period_amt
		FROM " . DB_NMU_ERP . "sp_sbill_items a
		WHERE
			i_enabled = 1
			AND sp_sbill_hdr_id = ?
			{$con}

	";
    $arrParam = array();
    $arrParam[] = $_REQUEST["sp_sbill_hdr_id"];

    if (@$_REQUEST["show_sql"]) {
        /*         * ****echo sql***** */
        $sql = str_replace('?', '#-#', $sqlMain);
        foreach ($arrParam as $fld => $value) {
            $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        }
        echo $sql;
        exit;
        /*         * ***************** */
    }

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => $row["numrow"],
            "sp_sbill_hdr_id" => $row["sp_sbill_hdr_id"],
            "c_doc_result_ref" => $row["c_doc_result_ref"],
            "c_doc_ref" => $row["c_doc_ref"],
            "d_doc_date" => ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
            "f_period_amt" => $row["f_period_amt"],
        );
        ${$root}[] = $temp;
    }

    $db->NextResult($stmt);
    $rowCounts = $db->Fetch($stmt);
    echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
} else if ($_REQUEST["type"] == "bg_expense_expire") {

    $sqlMain = "
		SELECT
			a.bg_expense_id
			,b.c_code AS c_group_code
			,b.c_name AS c_group_name
			,a.c_code
			,a.c_name
		FROM " . DB_NMU_EIS . "bg_expense a
			INNER JOIN " . DB_NMU_EIS . "bg_expense b ON LEFT(a.c_code_tree,2) = LEFT(b.c_code_tree,2) AND b.i_enable = 1 AND b.i_level = 1
		WHERE a.i_last = 1 AND a.i_delete = 2 AND a.i_enable = ? and isnull(a.i_expire,0) != 1
		ORDER BY a.c_code;";
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
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "bg_budget_dtl_overlap") {

    $sqlMain = "
		SELECT
			b.bg_budget_dtl_overlap_id
			,a.i_year
			,a.dc_expense_budget_type_id
			,c.c_name AS dc_expense_budget_type_name
			,b.c_code_ref
			,b.dc_cost_id
			,d.c_name AS dc_cost_name
			,b.bg_expense_id
			,e.c_name AS bg_expense_name
			,b.f_total
			,CASE
				WHEN isnull(b.i_extend_time,0) = 0 THEN b.f_cancel
				ELSE (SELECT isnull(sum(isnull(aa.f_cancel,0)),0) FROM bg_budget_extend_time_overlap aa WHERE aa.bg_budget_dtl_overlap_id = b.bg_budget_dtl_overlap_id )
			END AS f_cancel
		FROM bg_budget_hdr_overlap a
			INNER JOIN bg_budget_dtl_overlap b ON a.bg_budget_hdr_overlap_id = b.bg_budget_hdr_overlap_id
			INNER JOIN " . DB_CENTER . "dc_expense_budget_type c ON a.dc_expense_budget_type_id = c.dc_expense_budget_type_id
			INNER JOIN " . DB_CENTER . "dc_cost d ON b.dc_cost_id = d.dc_cost_id
			INNER JOIN " . DB_CENTER . "bg_expense e ON b.bg_expense_id = e.bg_expense_id AND e.i_level = 4
				AND e.i_enable = 1
		WHERE a.i_enable = ?
			AND a.i_year = {$_REQUEST["i_year"]}
			AND a.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}
			AND b.dc_cost_id = {$_REQUEST["dc_cost_id"]}
			AND b.bg_expense_id = {$_REQUEST["bg_expense_id"]}
		ORDER BY b.c_code_ref";

    $arrParam = array(STATUS_ENABLE);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["bg_budget_dtl_overlap_id"],
                "i_year" => $row["i_year"] + 543,
                "dc_expense_budget_type_name" => $row["dc_expense_budget_type_name"],
                "c_code_ref" => $row["c_code_ref"],
                "dc_cost_name" => $row["dc_cost_name"],
                "bg_expense_name" => $row["bg_expense_name"],
                "f_total" => $row["f_total"],
                "f_cancel" => $row["f_cancel"],
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "dc_expense_budget_type") {
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
                    . (@$_SESSION["user_id"] ?? "null") . ","
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
        if (@$_REQUEST["all"] == "sel") {
            ${$root}[] = array(
                "id" => "0",
                "c_name" => "- กรุณาเลือก -"
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
} else if ($_REQUEST["type"] == "expire") {

    if (@$_REQUEST["all"] == "all") {
        ${$root}[] = array(
            "id" => "0",
            "c_name" => "- เลือกทั้งหมด -"
        );
    }

    $temp = array(
        "id" => "2",
        "c_name" => "เกิน 60 วัน",
    );
    ${$root}[] = $temp;
} else if ($_REQUEST["type"] == "po_creditor") {

    $sqlMain = "SELECT a.* FROM dbo.po_creditor a WHERE a.i_delete = 2 AND a.i_enable = ? ORDER BY a.c_name";
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
                "id" => "{$row["po_creditor_id"]}",
                "c_name" => $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
} else if ($_REQUEST["type"] == "po_working_parent_view") {

    $sqlMain = "
		DECLARE @po_working_hdr_id BIGINT = ?;
		SET NOCOUNT ON;
		;WITH CategoryTree1 AS (
			SELECT po_working_hdr_id, parent_id, 1 AS level
			FROM " . DB_NMU_EIS . "po_working_hdr
			WHERE po_working_hdr_id = @po_working_hdr_id  /* id */

			UNION ALL

			SELECT c.po_working_hdr_id, c.parent_id, ct.level + 1
			FROM " . DB_NMU_EIS . "po_working_hdr c
			INNER JOIN CategoryTree1 ct ON c.parent_id = ct.po_working_hdr_id
		)
		SELECT * INTO #temp FROM CategoryTree1 ORDER BY level, parent_id;

		WITH CategoryTree2 AS (
			SELECT po_working_hdr_id, parent_id, 1 AS level
			FROM po_working_hdr
			WHERE po_working_hdr_id = @po_working_hdr_id  /* id */

			UNION ALL

			SELECT c.po_working_hdr_id, c.parent_id, ct.level + 1
			FROM " . DB_NMU_EIS . "po_working_hdr c
			INNER JOIN CategoryTree2 ct ON ct.parent_id = c.po_working_hdr_id
		)
		INSERT INTO #temp SELECT * FROM CategoryTree2 WHERE level > 1

			SELECT
			aa.po_working_hdr_id
			,i_is_url_pdf_hdr
			,i_is_url_pdf_dtl
			,c_file_pdf_hdr
			,c_url_pdf_hdr
			,c_file_pdf_dtl
			,c_url_pdf_dtl
			,c_file_pdf_pay
			,c_file_pdf_protest_hdr
			,c_file_pdf_protest_dtl
		INTO #temp_s2
		FROM " . DB_NMU_EIS . "po_working_item aa
		INNER JOIN (
			SELECT
				po_working_hdr_id
				,MAX(isnull(po_working_item_id,0)) AS po_working_item_id
				,MAX(isnull(CONVERT(FLOAT,i_sub_status),0)) AS max_sub_status
			FROM " . DB_NMU_EIS . "po_working_item
			WHERE i_enable = 1
			GROUP BY po_working_hdr_id
		) bb ON aa.po_working_item_id = bb.po_working_item_id AND aa.po_working_hdr_id = bb.po_working_hdr_id AND bb.max_sub_status = i_sub_status


		SELECT
			a.po_working_hdr_id
			,a.c_code_ref
			,b.dc_approve_id
			,s2.c_file_pdf_hdr
			,s2.c_file_pdf_dtl
			,(SELECT c_full_name FROM NMU_DATACENTER..dc_user aa WHERE aa.dc_user_id = b.dc_approve_id ) AS dc_approve_name
			,CONVERT(VARCHAR(10), b.d_doc_date,120) AS d_doc_date
			,i_enable
		FROM #temp temp
		INNER JOIN " . DB_NMU_EIS . "po_working_hdr a ON a.po_working_hdr_id = temp.po_working_hdr_id
		INNER JOIN " . DB_NMU_EIS . "po_working_dtl b ON b.po_working_hdr_id = temp.po_working_hdr_id
		LEFT JOIN #temp_s2 s2 ON s2.po_working_hdr_id = a.po_working_hdr_id
		ORDER BY a.po_working_hdr_id

		DROP TABLE #temp
	";
    $arrParam = array();
    $arrParam[] = $_REQUEST["id"];
    if (@$_REQUEST["show_sql"]) {
        /*         * ****echo sql***** */
        $sql = str_replace('?', '#-#', $sqlMain);
        foreach ($arrParam as $fld => $value) {
            $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        }
        echo $sql;
        exit;
        /*         * ***************** */
    }
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $no = 0;
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => ++$no,
            "id" => $row["po_working_hdr_id"],
            "c_code_ref" => $row["c_code_ref"],
            "dc_approve_id" => $row["dc_approve_id"],
            "dc_approve_name" => $row["dc_approve_name"],
            "d_doc_date" => ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
            "i_enable" => $row["i_enable"],
            "c_file_pdf_hdr" => $row["c_file_pdf_hdr"],
            "c_file_pdf_dtl" => $row["c_file_pdf_dtl"],
        );
        ${$root}[] = $temp;
    }

    echo json_encode(array("debug" => true, $root => ${$root}));
    exit;
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
