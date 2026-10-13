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
$c_code_gen = "TOR";
$re_id = null;
$stmt2 = true;
$stmt3 = true;

//End fn updateStaus
$db->BeginTran();
$d_tor_date = $data['d_tor_date'] ?? null;
$data['d_tor_date'] = !empty($d_tor_date) ? $date->bc_to_ad($data['d_tor_date']) : null;
$f_total_amt = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0; //str_replace(',', '', $data[$value]);
$data['dc_cost_id'] = $data['dc_cost_id'] ?? 38;
$data["c_comment"] = $data["c_comment"] ?? NULL;
switch ($mode) {
    case "LISTDTL":
        $id = $_REQUEST['tor_id'] ?? null;

        $f1 = $db->GetDataBySQL("select dc_expense_budget_type_id ,f_type_amt from dbo.sp_tor where tor_id=?", array($id));
//        $f2 = $db->GetDataBySQL("select dc_expense_budget_type2_id ,f_type2_amt  from dbo.sp_tor where tor_id=?", array($id));
//        $f3 = $db->GetDataBySQL("select dc_expense_budget_type3_id ,f_type3_amt  from dbo.sp_tor where tor_id=?", array($id));
//        $f4 = $db->GetDataBySQL("select dc_expense_budget_type4_id ,f_type4_amt  from dbo.sp_tor where tor_id=?", array($id));
//        $f5 = $db->GetDataBySQL("select dc_expense_budget_type5_id ,f_type5_amt  from dbo.sp_tor where tor_id=?", array($id));
        $arr = array();
        if ($f1['dc_expense_budget_type_id'] > 0) {
            $arr[] = array($f1['dc_expense_budget_type_id'], $f1['f_type_amt']);
        }
        if ($f2['dc_expense_budget_type2_id'] > 0) {
            $arr[] = array($f2['dc_expense_budget_type2_id'], $f2['f_type2_amt']);
        }
        if ($f3['dc_expense_budget_type3_id'] > 0) {
            $arr[] = array($f3['dc_expense_budget_type3_id'], $f3['f_type3_amt']);
        }
        if ($f4['dc_expense_budget_type4_id'] > 0) {
            $arr[] = array($f4['dc_expense_budget_type4_id'], $f4['f_type4_amt']);
        }
        if ($f5['dc_expense_budget_type5_id'] > 0) {
            $arr[] = array($f5['dc_expense_budget_type5_id'], $f5['f_type5_amt']);
        }
//    echo sizeof($arr);
//    print_R($arr);exit();
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
                    FROM sp_tor_dtl a
                    LEFT JOIN dc_unit_type b ON b.dc_unit_type_id=a.dc_unit_type_id
                    WHERE a.sp_tor_id=?"; // . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]);
        //  echo $sqlMain .'/*'; print_r($_REQUEST['tor_id']); echo '*/'; exit;
        $stmt = $db->QueryParam($sqlMain, array(1));
        //   $stmt = $db->QueryParam($sqlMain, array($_REQUEST['tor_id']));
        $i = @$start + 1;
        $total_sum = 0;
        $ii = 0;
        while ($row = $db->Fetch($stmt)) {
            $total = $row["i_qty"] * $row["f_unit_price"];

            for ($ii = 0; $ii < sizeof($arr); $ii++) {

                $temp = array(
                    "no" => $i++,
                    "dc_expense_budget_type_id" => $arr[$ii],
                    "dc_expense_budget_type_name" => $db->GetDataBySQL("select c_name from NMU.dbo.dc_expense_budget_type where dc_expense_budget_type_id=?", array($arr[$ii][0])),
                    "f_budget_type_amt" => number_format($arr[$ii][1], 2),
                    "id" => intval($ii),
                    "c_name" => $row["c_name"],
                    "dc_unit_type_id" => $row["dc_unit_type_id"],
                    "i_hire_type" => $row["i_hire_type"],
                    "dc_unit_name" => $row["dc_unit_name"],
                    "i_is_inv" => $row["i_is_inv"] == 1 ? true : false,
                    "i_product_type" => $row["i_product_type"],
                    "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                    "f_unit_price" => number_format($row["f_unit_price"], 2),
                    "inv_mode_id" => intval($row["inv_mode_id"]),
                    "am_mode_id" => intval($row["am_mode_id"]),
                    "sp_bg_mode_id" => intval($row["sp_bg_mode_id"]),
                    "f_peroid_amt" => intval($row["f_peroid_amt"]),
                    "f_total_amt" => number_format($total, 2),
                    "i_qty" => intval($row["i_qty"]),
                    "sp_tor_id" => intval($row["sp_tor_id"]),
                    "po_expense_id" => intval($row["po_expense_id"]),
                    "dc_expense_budget_type_id" => intval($row["dc_bg_budget_type_id"])
                );
                ${$root}[] = $temp;
                $total_sum += $total;
            }
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
