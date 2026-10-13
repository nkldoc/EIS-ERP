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

       $sql = "select a.i_year
                    ,a.dc_expense_budget_type_id
                    ,sum(b.f_total) as f_total
                from NMU..bg_budget_hdr a
                inner join NMU..bg_budget_dtl b on b.bg_budget_hdr_id = a.bg_budget_hdr_id
              where a.i_year=?
                     and a.dc_expense_budget_type_id=?
                     and b.bg_expense_id_lv2 = (select top 1 bg_expense_lv2_id from NMU..vw_bg_expense_with_parent where bg_expense_lv4_id=?)
              group by a.i_year ,a.dc_expense_budget_type_id";
    $f_bg = $db->GetDataBySQL($sql, array($i_yyyy, $dc_expense_budget_type_id, $dc_expense_id)); // sum level 2 เทียบเงิน level 4
    $f_booking = 0;
    $re = array("reval" => 0, "success" => "Success", "msg" => "commit", "f_bg" => $f_bg["f_total"] ?? 0, "f_booking" => $f_booking);

    echo json_encode($re);
    exit;
}


