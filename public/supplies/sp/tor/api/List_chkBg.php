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

if ($_REQUEST["i_yyyy"] && $_REQUEST['dc_expense_budget_type_id'] && $_REQUEST['dc_expense_id']) {
    $i_yyyy = $_REQUEST["i_yyyy"] ?? null;
    $dc_expense_budget_type_id = $_REQUEST['dc_expense_budget_type_id'] ?? null; //null
    $dc_expense_id = $_REQUEST['dc_expense_id'] ?? null; //null

    $sql = "select * from (
                    SELECT
                     a.i_year
                     , a.dc_expense_budget_type_id
                     , a.bg_expense_id_lv2
                     , ISNULL(a.f_total_income,0) AS f_income
                     , ISNULL(b.f_total_working,0) AS f_working
                     , ISNULL(a.f_total_income,0)- ISNULL(b.f_total_working,0) AS f_total
                    FROM (
                     SELECT
                      a.i_year
                      , a.dc_expense_budget_type_id
                      , b.bg_expense_id_lv2
                      , SUM(b.f_total) AS f_total_income
                     FROM NMU..bg_budget_hdr_income a
                     INNER JOIN NMU..bg_budget_dtl_income b ON a.bg_budget_hdr_income_id = b.bg_budget_hdr_income_id
                     WHERE a.i_enable = 1 AND bg_expense_id_lv2 IS NOT NULL
                     GROUP BY a.i_year, a.dc_expense_budget_type_id, b.bg_expense_id_lv2
                    )a
                    LEFT JOIN (
                     select
                      b.i_budget_year_overlap
                      ,b.dc_expense_budget_type_id
                      , c.bg_expense_lv2_id
                      , SUM(b.f_total) AS f_total_working
                     FROM NMU..po_working_hdr a
                     INNER JOIN NMU..po_working_dtl b ON a.po_working_hdr_id  = b.po_working_hdr_id
                     LEFT JOIN NMU..vw_bg_expense_with_parent c ON b.bg_expense_id = c.bg_expense_lv4_id
                     WHERE a.i_enable = 1 AND b.i_success = 1
                     GROUP BY b.i_budget_year_overlap, b.dc_expense_budget_type_id , c.bg_expense_lv2_id
                    ) b ON a.i_year = b.i_budget_year_overlap
                    AND a.dc_expense_budget_type_id = b.dc_expense_budget_type_id
                    AND a.bg_expense_id_lv2 = b.bg_expense_lv2_id
) aa
 where i_year=? and dc_expense_budget_type_id=? and bg_expense_id_lv2 = (select top 1 bg_expense_lv2_id
 from NMU..vw_bg_expense_with_parent where bg_expense_lv4_id=?)";

    $f_bg = $db->GetDataBySQL($sql, array($i_yyyy, $dc_expense_budget_type_id, $dc_expense_id)); // sum level 2 เทียบเงิน level 4
    $f_booking = 0;
    if (true)
        $re = array("reval" => 0, "success" => "Success", "msg" => "commit", "f_bg" => $f_bg["f_total"], "f_booking" => 0);
    else
        $re = array("reval" => 0, "success" => "Success", "msg" => "commit", "f_bg" => $f_bg["f_total"] ?? 0, "f_booking" => $f_booking);

    echo json_encode($re);
    exit;
}


