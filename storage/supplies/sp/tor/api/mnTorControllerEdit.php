<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"];
$table = "dbo.sp_tor";
$keyName = "tor_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "PR";
$re_id = null;
$stmt2 = true;
$stmt3 = true;

$arrParam = array();
$addField = null;
$addValue = null;
$arrValue = array();

//End fn updateStaus
$db->BeginTran();
$d_tor_date = $data['d_tor_date'] ?? null;
$data['d_tor_date'] = !empty($d_tor_date) ? $date->bc_to_ad($data['d_tor_date']) : null;
$f_total_amt = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0; //str_replace(',', '', $data[$value]);
$data['dc_cost_id'] = $data['dc_cost_id'] ?? 38;
$data["c_comment"] = $data["c_comment"] ?? NULL;

switch ($mode) {
    case "UPDATEADMIN":
        $arrValue[] = $data["po_expense_id"];
        $arrValue[] = $data["id"];
        $arrValue[] = $data["c_name"];
        $arrValue[] = $data["d_update"];
        $arrValue[] = $data["dc_user_update_id"];
        $arrValue[] = $data["dc_user_update_cost_id"];
        // print_r($data);
        $sql = "
            declare @po_expense_id bigint = ?
            declare @sp_tor_id bigint = ?

            UPDATE {$table}
            SET c_name = ?,
            d_update = ?,
            dc_user_update_id = ?,
            dc_user_update_cost_id = ?,
            po_expense_id = @po_expense_id
            WHERE tor_id = @sp_tor_id

            UPDATE sp_tor_dtl SET po_expense_id = @po_expense_id where  sp_tor_id = @sp_tor_id
            UPDATE sp_tor_dtl_period SET po_expense_id = @po_expense_id where  sp_tor_id = @sp_tor_id
            UPDATE nmu..bg_reserve_money SET bg_expense_id = @po_expense_id where  pr_id  = @sp_tor_id

            update sp_check_period_dtl set po_expense_id = @po_expense_id 
            where sp_check_period_hdr_id = (select sp_tor_dtl_period_id from sp_tor_dtl_period where sp_tor_id = @sp_tor_id)
            
            update sp_withdraw set bg_expense_id = @po_expense_id  
            where sp_tor_contract_id = (select sp_tor_contract_id from sp_tor_contract where sp_tor_id = @sp_tor_id )

            ";


        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "LISTDTL":

        ###########################################
        $root = "data";
        $data = array();
        /* ALTER TABLE NMU_ERP.dbo.sp_tor_dtl ADD am_mode_id int;
              ALTER TABLE NMU_ERP.dbo.sp_tor_dtl ADD inv_mode_id int;
              ALTER TABLE NMU_ERP.dbo.sp_tor_dtl ADD sp_bg_mode_id int;
              ALTER TABLE NMU_ERP.dbo.sp_tor_dtl ADD f_peroid_amt decimal (18,2) ; */
        $sqlMain = "SELECT b.f_value
                            , b.c_name AS dc_unit_name
                            , a.dc_unit_type_id
                            , a.sp_tor_dtl_id
                            , a.sp_tor_id
                            , a.dc_creditor_id
                            , a.i_hire_type
                            , a.am_mode_id
                            , a.inv_mode_id
                            , a.sp_bg_mode_id
                            , a.f_peroid_amt
                            , a.i_is_inv
                            , isnull(a.i_product_type,0) as i_product_type 
                            , a.c_name
                            , a.dc_bg_budget_type_id
                            , a.po_expense_id
                            , a.f_disc_price
                            , a.i_qty
                            , a.f_unit_price
                            , a.f_net_total_price
                            , a.i_pr_type1
                            , a.bg_reserve_money_id
                        FROM sp_tor_dtl a
                        LEFT JOIN dc_unit_type b ON b.dc_unit_type_id=a.dc_unit_type_id
                        WHERE a.sp_tor_id=?"; // . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]);
        //  echo $sqlMain .'/*'; print_r($_REQUEST['tor_id']); echo '*/'; exit;
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['tor_id']));
        $i = @$start + 1;
        $total_sum = 0;
        while ($row = $db->Fetch($stmt)) {
            $total = $row["i_qty"] * $row["f_unit_price"];
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_dtl_id"]),
                "c_name" => $row["c_name"],
                "dc_unit_type_id" => $row["dc_unit_type_id"],
                "i_hire_type" => $row["i_hire_type"],
                "dc_unit_name" => $row["dc_unit_name"],
                "i_is_inv" => $row["i_is_inv"] == 1 ? true : false,
                "i_product_type" => $row["i_product_type"],
                "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                "i_pr_type1" => $row["i_pr_type1"],
                "f_unit_price" => number_format($row["f_unit_price"], 2),
                "inv_mode_id" => intval($row["inv_mode_id"]),
                "am_mode_id" => intval($row["am_mode_id"]),
                "sp_bg_mode_id" => intval($row["sp_bg_mode_id"]),
                "f_peroid_amt" => intval($row["f_peroid_amt"]),
                "f_total_amt" => number_format($total, 2),
                "i_qty" => intval($row["i_qty"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_expense_budget_type_id" => intval($row["dc_bg_budget_type_id"]),
                "bg_reserve_money_id" => intval($row["bg_reserve_money_id"])
            );
            ${$root}[] = $temp;
            $total_sum += $total;
        }

        echo json_encode(array("debug" => true, 'totalSum' => $total_sum, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
        
}
if ($stmt && $stmt2 && $stmt3) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $re_id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
