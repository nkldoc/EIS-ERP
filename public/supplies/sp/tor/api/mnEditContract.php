<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$table = "dbo.sp_tor";
$keyName = "tor_id";

$mode = $_REQUEST["mode"] ?? null;

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;
$db->BeginTran();

switch ($mode) {
    case "Edit_contrct":
        $arrParam = array();
        $arrValue = array();

        $i_is_book = $_REQUEST['i_is_book'] ?? NULL;
        $i_is_book = $i_is_book == '- ไม่มีการค้ำประกัน -' ? NULL : $i_is_book;

        $COUNT_EDIT = $db->GetDataBySQL("select COUNT(sp_tor_id) as sp_tor_id  from sp_tor_contract_edit where i_enabled = 1  and sp_tor_id = {$_REQUEST['sp_tor_id']} group by sp_tor_id  ", array($_REQUEST["sp_tor_id"]));
        $stmt3 = $db->QueryParam("select
        CONVERT(VARCHAR, d_doc_date, 120) AS d_doc_date
        ,CONVERT(VARCHAR, d_due_date, 120) AS d_due_date
        ,CONVERT(VARCHAR, d_contract_receiving_date, 120) AS d_contract_receiving_date
        ,CONVERT(VARCHAR, d_contract_start_date, 120) AS d_contract_start_date
        , f_total_amt

        ,i_type_guarantee
        ,book_seq
        ,d_book_date
        ,f_warranty_amt

        ,book_warranty_no
        ,d_book_warranty_date
        ,dc_bank_id
        ,f_book_warranty_amt
        ,d_book_warranty_end

        ,cashiercheque_on
        ,cashiercheque_seq
        ,d_cashiercheque_data
        ,f_warranty_cashiercheque
        from sp_tor_contract where  sp_tor_contract_id = {$_REQUEST['sp_tor_contract_id']} ;", array($_REQUEST["sp_tor_contract_id"]));
        $row = $db->Fetch($stmt3);
        $arrParam["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        $arrParam["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"];
        $arrParam["i_enabled"] = $_REQUEST["i_enabled"];
        $arrParam["c_comment"] = $_REQUEST["c_comment"];
        $arrParam["i_type"] = $_REQUEST["i_type_update"] ?? null;
        $arrParam["row_edit"] = $COUNT_EDIT + 1;

        $arrParam['i_type_guarantee'] = $row['i_type_guarantee'];
        $arrParam['book_seq'] = $row['book_seq'];
        $arrParam['d_book_date'] = $row['d_book_date'];
        $arrParam['f_warranty_amt'] = $row['f_warranty_amt'];

        $arrParam['book_warranty_no'] = $row['book_warranty_no'];
        $arrParam['d_book_warranty_date'] = $row['d_book_warranty_date'];
        $arrParam['dc_bank_id'] = $row['dc_bank_id'];
        $arrParam['f_book_warranty_amt'] = $row['f_book_warranty_amt'];
        $arrParam['d_book_warranty_end'] = $row['d_book_warranty_end'];

        $arrParam['cashiercheque_on'] = $row['cashiercheque_on'];
        $arrParam['cashiercheque_seq'] = $row['cashiercheque_seq'];
        $arrParam['d_cashiercheque_data'] = $row['d_cashiercheque_data'];
        $arrParam['f_warranty_cashiercheque'] = $row['f_warranty_cashiercheque'];

        $arrParam['d_doc_date'] = $row['d_doc_date'];
        $arrParam['d_contract_receiving_date'] = $row['d_contract_receiving_date'];
        $arrParam['d_contract_start_date'] = $row['d_contract_start_date'];
        $arrParam['d_due_date'] = $row['d_due_date'];
        $arrParam["f_total_amt"] = str_replace(",", "", $row["f_total_amt"]);
        $arrParam["dc_user_create_id"] = $_SESSION["user_id"];
        $arrParam["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $arrParam["d_create"] = date("Y-m-d H:i:s");
        $arrParam["dc_user_update_id"] = $_SESSION["user_id"];
        $arrParam["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $arrParam["d_update"] = date("Y-m-d H:i:s");
        $addField = "";
        $addValue = "";
        foreach ($arrParam as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }
        $sql = "INSERT INTO sp_tor_contract_edit (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";
        // $arrValue[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrValue);
        unset($arrParam);
        unset($addField);
        unset($arrValue);
        $arrValue = null;

        $arrParam["i_type_guarantee"] = $i_is_book;
        $arrParam["book_seq"] = $_REQUEST["c_receipt_no"] ?? null;
        $arrParam["d_book_date"] = !empty($_REQUEST['d_book_date']) ? $date->bc_to_ad($_REQUEST['d_book_date']) : null;
        $val_warranty = str_replace(",", "", $_REQUEST["f_warranty_amt"] ?? '');
        $arrParam["f_warranty_amt"] = ($val_warranty == '' || $val_warranty == 0) ? null : $val_warranty;

        $arrParam["book_warranty_no"] = $_REQUEST["c_doc_no"] ?? null;
        $arrParam["d_book_warranty_date"] = !empty($_REQUEST['d_doc_date1']) ? $date->bc_to_ad($_REQUEST['d_doc_date1']) : null;
        $arrParam["d_book_warranty_end"] = !empty($_REQUEST['d_expire_warranty']) ? $date->bc_to_ad($_REQUEST['d_expire_warranty']) : null;
        $val_book_warranty = str_replace(",", "", $_REQUEST["f_warranty_amt1"] ?? '');
        $arrParam["f_book_warranty_amt"] = ($val_book_warranty == '' || $val_book_warranty == 0) ? null : $val_book_warranty;
        $arrParam["dc_bank_id"] = $_REQUEST["dc_bank_id"] ?? null;

        // $arrParam['cashiercheque_on'] = $_REQUEST['c_receipt_cashiercheque'] ?? null;
        $arrParam['cashiercheque_seq'] = $_REQUEST['c_receipt_cashiercheque'] ?? null;
        $arrParam["d_cashiercheque_data"] = !empty($_REQUEST['d_cashiercheque_date']) ? $date->bc_to_ad($_REQUEST['d_cashiercheque_date']) : null;
        $val_warranty_cashiercheque = str_replace(",", "", $_REQUEST["f_cashiercheque_warranty_amt2"] ?? '');
        $arrParam['f_warranty_cashiercheque'] = ($val_warranty_cashiercheque == '' || $val_warranty_cashiercheque == 0) ? null : $val_warranty_cashiercheque;

        $arrParam['d_doc_date'] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
        $arrParam['d_contract_receiving_date'] = !empty($_REQUEST['d_contract_receiving_date']) ? $date->bc_to_ad($_REQUEST['d_contract_receiving_date']) : null;
        $arrParam['d_contract_start_date'] = !empty($_REQUEST['d_contract_start_date']) ? $date->bc_to_ad($_REQUEST['d_contract_start_date']) : null;
        $arrParam['d_due_date'] = !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null;
        $arrParam["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amt"]);
        $arrParam["i_working_day"] = $_REQUEST["i_working_day"] ?? null;

        $arrParam["dc_user_update_id"] = $_SESSION["user_id"];
        $arrParam["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $arrParam["d_update"] = date("Y-m-d H:i:s");
        $addField = "";
        foreach ($arrParam as $fldA2 => $value2) {
            $arrValue[] = ($value2 != "") ? $value2 : null;
            $addField .= ", {$fldA2} = ?";
        }
        $arrValue[] = $_REQUEST['sp_tor_contract_id'];
        $sql2 = "UPDATE sp_tor_contract SET " . substr($addField, 1) . " WHERE sp_tor_contract_id =  ?";
        $stmt2 = $db->QueryParam($sql2, $arrValue);

        break;
    case "DELETE_EDIT_CONTRACT":
        unset($arrParam);
        $arrParam = array();
        $arrParam[] = $_REQUEST["i_enabled"];
        $arrParam[] = $_REQUEST["sp_tor_contract_edit"] ?? null;
        $sql = "UPDATE dbo.sp_tor_contract_edit SET i_enabled =?    WHERE sp_tor_contract_edit = ?";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "delete_contractNew":
        unset($arrParam);
        $arrParam = array();
        $arrParam[] = $_REQUEST["i_enabled"];
        $arrParam[] = $_SESSION["user_id"];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = date("Y-m-d H:i:s");
        $arrParam[] = $_REQUEST["SP_TOR_HDR_PERIOD_ID"] ?? null;

        $arrParam[] = $_REQUEST["i_enabled"];
        $arrParam[] = $_SESSION["user_id"];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = date("Y-m-d H:i:s");
        $arrParam[] = $_REQUEST["SP_TOR_HDR_PERIOD_ID"] ?? null;

        $sql = "UPDATE dbo.sp_tor_hdr_period SET i_enabled =?
        ,dc_user_update_id  = ?
        ,dc_user_update_cost_id = ?
        ,d_update = ?
        WHERE sp_tor_hdr_period_id = ?

                UPDATE dbo.sp_tor_dtl_period SET i_enabled =?
        ,dc_user_update_id  = ?
        ,dc_user_update_cost_id = ?
        ,d_update = ?
        WHERE sp_tor_hdr_period_id = ? ";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "UP_SP_TOR_HDR_DTL_PERIOD":
        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        $db->GetDataBySQL('update dbo.sp_tor_hdr_period set i_is_last = null where sp_tor_contract_id = ?', array($_REQUEST['sp_tor_contract_id']));
        $d_update = date("Y-m-d H:i:s");
        $data["sp_tor_contract_id"] = $_REQUEST['sp_tor_contract_id'];
        $data["dc_expense_budget_type_id"] = $_REQUEST['dc_expense_budget_type_id'] ?? null;
        $data["i_period"] = $_REQUEST['i_period'];
        $data["i_pr_type1"] = $_REQUEST['i_pr_type1'] ?? null;
        $data["i_is_last"] = $_REQUEST['i_is_last'] ?? null;

        $data['d_doc_date'] = !empty($_REQUEST['d_doc_datePer']) ? $date->bc_to_ad($_REQUEST['d_doc_datePer']) : null;

        $data["sp_po_id"] = $db->GetDataBySQL('SELECT sp_po_id FROM sp_po_hdr WHERE isnull(i_is_po,0) = 0 and sp_tor_contract_id = ?', array($_REQUEST['sp_tor_contract_id']));
        $data["i_day"] = $_REQUEST['i_day'];
        $data["i_alert"] = $_REQUEST['i_alert'];

        $data['d_period_date'] = !empty($_REQUEST['d_period_date']) ? $date->bc_to_ad($_REQUEST['d_period_date']) : null;
        $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amtPer"]);
        // $data["i_is_status"]		    = @$_REQUEST['i_seq_status'];
        $data["c_discription"] = $_REQUEST["c_discription"] ?? null;
        $data['dc_cost_id'] = $_REQUEST['dc_cost2_id'] ?? null;
        // $data["i_is_po"] = @$_REQUEST["i_is_po"];
        $data['dc_user_create_id'] = $_SESSION["user_id"];
        $data['dc_user_create_cost_id'] = $_SESSION["dc_cost_id"];
        $data['dc_user_create_department_id'] = $_SESSION["dc_department_id"];
        $data['d_create'] = date("Y-m-d H:i:s");
        $data['dc_creditor_id'] = $_REQUEST["dc_creditor_id"] ?? null;
        $data['i_joint_venture'] = $_REQUEST["i_is_join_venture_per"] ?? null;
        $data['i_is_product_last'] = $_REQUEST["i_product_type"] ?? null;
        if ($_REQUEST['i_type_edit'] == 2) {
            // if ($_REQUEST['copy_contract_dtl'] == 'save') {
            foreach ($data as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fldA} = ?";
            }
            $sql = "UPDATE sp_tor_hdr_period SET " . substr($addField, 1) . " WHERE sp_tor_hdr_period_id = ?";

            $arrValue[] = $_REQUEST["sp_tor_hdr_period_id"];
            $stmt = $db->QueryParam($sql, $arrValue);

            $re_id = $_REQUEST['sp_tor_hdr_period_id'];
            $i_period = $data["i_period"];
            $d_period_date = $data['d_period_date'];
            $f_total_amt = $data["f_total_amt"];
            $arrValue2[] = $_REQUEST['i_product_type'] ?? null;
            $arrValue2[] = $_REQUEST['dc_expense_budget_type_id'] ?? null;
            $arrValue2[] = $_REQUEST["period_po_expense_id"];
            $arrValue2[] = $_REQUEST['i_is_item'] ?? null;
            $arrValue2[] = $_REQUEST['i_hire_type_l'] ?? null;
            $arrValue2[] = $f_total_amt;
            $arrValue2[] = $f_total_amt;
            $arrValue2[] = $_SESSION["user_id"];
            $arrValue2[] = $_SESSION["dc_cost_id"];
            $arrValue2[] = date("Y-m-d H:i:s");
            $arrValue2[] = $re_id;
            $sql2 = "UPDATE dbo.sp_tor_dtl_period SET  i_product_type =?
                , dc_bg_budget_type_id =?
                , po_expense_id =?
                , i_hire_type =?
                , i_is_item =?
                , f_net_unit_price =?
                , f_net_total_price = ?
                , dc_user_update_id =?
                , dc_user_update_cost_id =?
                , d_update =?
                WHERE sp_tor_hdr_period_id = ?";

            $stmt2 = $db->QueryParam($sql2, $arrValue2);
            $ss_id = $db->Fetch($stmt2);
            $re_id = $ss_id["id"];
            $dc_creditor_name = $ss_id["dc_creditor_name"];
            $c_doc_ref_contract = $ss_id["c_doc_ref_contract"];
            $i_period = $data["i_period"];
            $d_period_date = $data['d_period_date'];
            $f_total_amt = $data['f_total_amt'];
        } else {
            // f_total_amt
            $data["period_status_id"] = 4; //รอส่งมอบงาน
            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
            $tor_id = $_REQUEST['tor_id'] ?? null;
            $row = $db->GetDataBySQL("select left(c_code,len(c_code)-5) as front,right(c_code,5) as back from dbo.sp_tor_contract where sp_tor_id=?", array($tor_id));
            $data['already_withdrawn'] = $_REQUEST['already_withdrawn'] ?? null;
            $data['i_pr_type1'] = $_REQUEST['i_pr_type1'];
            $c_code = $row['front'] . '/' . $data['i_period'] . $row['back'];
            $data['c_contract_code'] = $c_code;
            $data['dc_cost_id'] = $_REQUEST['dc_cost2_id'] ?? null;
            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }
            $sql = "SET NOCOUNT ON
                        INSERT INTO dbo.sp_tor_hdr_period (" . substr($addField, 1) . ",i_enabled) VALUES (" . substr($addValue, 1) . ",1);
                        SELECT
                            a.sp_tor_hdr_period_id AS id
                            , a.sp_tor_contract_id
                            , b.c_code as c_doc_ref_contract
                            , b.dc_creditor_id
                            , (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id ) AS dc_creditor_name
                            , a.sp_po_id
                            , a.i_is_status
                            , a.i_period
                            , a.f_total_amt
                            , a.i_is_last
                            , a.c_discription
                            , convert(varchar, d_period_date, 120) as d_period_date
                        FROM dbo.sp_tor_hdr_period a
                        INNER join sp_tor_contract b on b.sp_tor_contract_id = a.sp_tor_contract_id
                        WHERE sp_tor_hdr_period_id = @@IDENTITY
                        INSERT INTO dbo.sp_tor_item (tor_id
                            , contract_id
                            , sp_tor_hdr_period_id
                            , d_period_status_date
                            , act_user_id
                            , act_cost_id
                            , act_date_dt
                        ) VALUES (
                            (SELECT sp_tor_id FROM sp_tor_contract WHERE sp_tor_contract_id = {$data["sp_tor_contract_id"]})
                            ,{$data['sp_tor_contract_id']}
                            ,@@IDENTITY
                            ,'{$data['d_period_date']}'
                            ,{$_SESSION["user_id"]}
                            ,{$_SESSION["dc_cost_id"]}
                            ,'{$d_update}'
                        );
                        ";
            $stmt = $db->QueryParam($sql, $arrValue);
            $ss_id = $db->Fetch($stmt);
            $re_id = $ss_id["id"];
            $dc_creditor_name = $ss_id["dc_creditor_name"];
            $c_doc_ref_contract = $ss_id["c_doc_ref_contract"];
            $i_period = $data["i_period"];
            $d_period_date = $data['d_period_date'];
            $dc_cost2_id = $data['dc_cost_id'] ?? null;
            $f_total_amt = $data['f_total_amt'];
            // ****** dtl_auto
            $root = "data";
            $data = array();
            $msg = "";
            // ============== //
            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
            // ============== //

            $data["sp_tor_id"] = $_REQUEST["tor_id"];
            $data["sp_tor_hdr_period_id"] = $re_id;
            $data["dc_bg_budget_type_id"] = $_REQUEST["dc_expense_budget_type_id"];
            $data["po_expense_id"] = $_REQUEST["period_po_expense_id"];
            $data["i_hire_type"] = $_REQUEST["i_hire_type_l"];
            if ($data["i_hire_type"] == 0) {
                $data["i_product_type"] = null;
                $data["i_is_inv"] = null;
            } else {
                // $data["i_product_type"] = $_REQUEST["i_product_typehdr"];
                // $data["i_is_inv"] = $_REQUEST["i_is_inv"]; // เข้าคลัง หรือไม่เข้าคลัง  f_total_amtPer
            }
            $data["i_product_type"] = $_REQUEST["i_product_type"] ?? null;

            $data["inv_mode_id"] = $_REQUEST["inv_mode_id"] ?? null;
            $data["am_mode_id"] = $_REQUEST["am_mode_id"] ?? null;
            $data["c_name"] = $_REQUEST["c_name"] ?? null;
            $data["i_qty"] = $_REQUEST["i_qty"] ?? null;
            $data["i_is_item"] = $_REQUEST["i_is_item"] ?? null;
            $data["f_net_unit_price"] = str_replace(',', '', $_REQUEST["f_total_amtPer"]);
            $data["f_net_total_price"] = str_replace(',', '', $_REQUEST["f_total_amtPer"]);
            // $data["f_net_total_price"] = $_REQUEST["f_total_amtPer"] ;
            $data["dc_unit_type_id"] = $_REQUEST["dc_unit_type_id"];
            $data["dc_creditor_id"] = $db->GetDataBySQL('SELECT dc_creditor_id FROM sp_tor_contract WHERE  sp_tor_contract_id = ?', array($_REQUEST["sp_tor_contract_id"]));

            $data["dc_user_update_id"] = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }

            $sql = "SET NOCOUNT ON
                    INSERT INTO sp_tor_dtl_period (" . substr($addField, 1) . ", i_enabled ) VALUES (" . substr($addValue, 1) . ",1);
                    SELECT @@IDENTITY as id;";
            $stmt = $db->QueryParam($sql, $arrValue);
        }

        unset($data);
        unset($arrValue);

        if ($stmt) {
            $db->CommitTran();
            $re = array(
                "reval" => 0,
                "success" => "Success",
                "msg" => "บันทึกเรียบร้อยแล้ว",
                "id" => $re_id,
                "i_period" => $i_period,
                "d_period_date" => $d_period_date,
                "c_doc_ref_contract" => $c_doc_ref_contract,
                "dc_creditor_name" => $dc_creditor_name,
                "f_total_amt" => $f_total_amt
            );
        } else {
            $db->RollBackTran();
            $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
        }
        echo json_encode($re);
        exit;
        break;
}
if ($stmt && $stmt2 && $stmt3 && $stmt4) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $re_id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
