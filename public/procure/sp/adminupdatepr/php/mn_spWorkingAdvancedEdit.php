<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$root = "data";
$data = array();

// $mode		= $_REQUEST["mode"];
$arrParam = array();
$addField = null;
$addValue = null;
$arrValue = array();

$dirLog = "../../../_logs";
$mode = $_REQUEST["mode"];
$table = "sp_tor";
$keyName = "tor_id";

if (empty($_SESSION) && empty($_SESSION['user_id'])) {
    $msg = "Session หมดอายุ";
    echo json_encode(array("reval" => 1, "success" => "Error", "msg" => $msg));
    exit;
} else {

    $info[1] = $_SESSION['user_id'];
    $info[2] = $_SESSION['dc_cost_id'];
    $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
// toDoLog
}


$msg = "";
$addField = null;
$addValue = null;

$debugSql = $_REQUEST['sqld'] ?? null;
switch ($mode) {

    case "SETDISABLED":
        $val = $_REQUEST['i_enabled'] ?? null;
        $id = $_REQUEST['id'] ?? null;
        $arrValue = [$val, $info[1], $info[2], $info[3], $id];
        $sql = " UPDATE dbo.sp_tor SET i_enabled = ? , "
                . " dc_user_update_id =?   , "
                . " dc_user_update_cost_id =?  , "
                . " d_update = ? "
                . "  WHERE tor_id = ?;";
        if ($debugSql) {
            echo $db->debugSql($sql, $arrValue);
            exit();
        }
        $para = $db->QueryParam($sql, $arrValue);
        $msg = "SET สถานะ";
        if ($para) {
//           @ todo log
        }
        break;

    case "ADD":
    case "EDIT":

        unset($data);
        unset($arrValue);
        // ============== //
        $data["sp_emp_id"] = $_REQUEST["sp_emp_id"];
        $data["dc_department_id"] = $_REQUEST["dc_department_id"];
        $data["c_name"] = $_REQUEST["c_name"];

        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld} = ?";
        }

        $arrValue[] = $_REQUEST["id"];
        $sql = "UPDATE sp_tor SET " . substr($addField, 1) . " WHERE tor_id = ?;";
        $para = $db->QueryParam($sql, $arrValue);

        /* ========================== sp_tor_dtl ========================== */
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        $data["c_name"] = $_REQUEST["c_name"];
        // $data["i_budget_year"]                        = $_REQUEST["i_budget_year"];
        // $data["i_budget_year_overlap"]                = $_REQUEST["i_budget_year_overlap"];
        // $data["dc_expense_budget_type_id"]            = $_REQUEST["dc_expense_budget_type_id"];
        // $data["bg_expense_id"]                        = $_REQUEST["bg_expense_id"];
        // $data["dc_cost_id"]                           = $_REQUEST["dc_cost_id"];
        // $data["po_creditor_id"]                       = $_REQUEST["po_creditor_id"];
        // $data["po_creditor_transfer_id"]              = $_REQUEST["po_creditor_transfer_id"];
        // $data["c_qty"]                                = $_REQUEST["c_qty"];
        // $data["f_total"]                              = $_REQUEST["f_total"];
        // $data["d_audit_date"]                         = $_REQUEST["d_audit_date"];
        // $data["po_emp_id"]                            = $_REQUEST["po_emp_id"];
        // $data["d_doc_date"]                           = $_REQUEST["d_doc_date"];
        // $data["dc_approve_id"]                        = $_REQUEST["dc_approve_id"];
        // $data["d_inv_date"]                           = $_REQUEST["d_inv_date"];
        // $data["c_approve"]                            = $_REQUEST["c_approve"];
        // $data["d_approve_date"]                       = $_REQUEST["d_approve_date"];
        // $data["c_booking"]                            = $_REQUEST["c_booking"];
        // $data["i_protest"]                            = $_REQUEST["i_protest"] == 0 ? null : $_REQUEST["i_protest"];

        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld} = ?";
        }

        $arrValue[] = $_REQUEST["sp_tor_dtl_id"];
        $sql = "UPDATE sp_tor_dtl SET " . substr($addField, 1) . " WHERE sp_tor_dtl_id = ?;";
        $para = $db->QueryParam($sql, $arrValue);

        // $id		= $_REQUEST["id"];
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        /* ========================== sp_tor_contract ========================== */
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $data['d_doc_date'] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
        $data['d_start_date'] = !empty($_REQUEST['d_start_date']) ? $date->bc_to_ad($_REQUEST['d_start_date']) : null;
        $data['d_due_date'] = !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null;
        $data["sp_emp_id"] = $_REQUEST["sp_emp_id"];

        // $data["i_budget_year"]                        = $_REQUEST["i_budget_year"];
        // $data["i_budget_year_overlap"]                = $_REQUEST["i_budget_year_overlap"];
        // $data["dc_expense_budget_type_id"]            = $_REQUEST["dc_expense_budget_type_id"];
        // $data["bg_expense_id"]                        = $_REQUEST["bg_expense_id"];
        // $data["dc_cost_id"]                           = $_REQUEST["dc_cost_id"];
        // $data["po_creditor_id"]                       = $_REQUEST["po_creditor_id"];
        // $data["po_creditor_transfer_id"]              = $_REQUEST["po_creditor_transfer_id"];
        // $data["c_qty"]                                = $_REQUEST["c_qty"];
        // $data["f_total"]                              = $_REQUEST["f_total"];
        // $data["d_audit_date"]                         = $_REQUEST["d_audit_date"];
        // $data["po_emp_id"]                            = $_REQUEST["po_emp_id"];
        // $data["d_doc_date"]                           = $_REQUEST["d_doc_date"];
        // $data["dc_approve_id"]                        = $_REQUEST["dc_approve_id"];
        // $data["d_inv_date"]                           = $_REQUEST["d_inv_date"];
        // $data["c_approve"]                            = $_REQUEST["c_approve"];
        // $data["d_approve_date"]                       = $_REQUEST["d_approve_date"];
        // $data["c_booking"]                            = $_REQUEST["c_booking"];
        // $data["i_protest"]                            = $_REQUEST["i_protest"] == 0 ? null : $_REQUEST["i_protest"];

        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld} = ?";
        }

        $arrValue[] = $_REQUEST["sp_tor_contract_id"];
        $sql = "UPDATE sp_tor_contract  SET " . substr($addField, 1) . " WHERE sp_tor_contract_id = ?;";
        $para = $db->QueryParam($sql, $arrValue);

        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        /* ========================== sp_mn_contract_hdr ========================== */
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        // $data['d_doc_date'] 							= !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
        // $data['d_start_date'] 							= !empty($_REQUEST['d_start_date']) ? $date->bc_to_ad($_REQUEST['d_start_date']) : null;
        // $data['d_due_date'] 							= !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null;
        $data["sp_emp_id"] = $_REQUEST["sp_emp_mn_id"];

        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld} = ?";
        }

        $arrValue[] = $_REQUEST["sp_mn_contract_hdr_id"];
        $sql = "UPDATE sp_mn_contract_hdr  SET " . substr($addField, 1) . " WHERE sp_mn_contract_hdr_id = ?;";
        $para = $db->QueryParam($sql, $arrValue);

        $id = $_REQUEST["id"];

        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        if (@$para) {
            $re = array(
                "success" => true,
                "id" => $id,
                "msg" => "บันทึกข้อมูลเรียบร้อย"
            );
        } else {
            $re = array(
                "success" => false,
                "msg" => $msg
            );
        }

        break;

    case "DELETE":
        $sql = "/* " . $_POST['c_code_ref'] . " */
			DECLARE @id AS bigint; SET @id = ?;
			DECLARE @dc_user_del_id AS bigint; SET @dc_user_del_id = ?;
			DECLARE @dc_user_del_cost_id AS bigint; SET @dc_user_del_cost_id = ?;
			DECLARE @d_del AS datetime; SET @d_del = ?;

			INSERT INTO po_working_hdr_del (po_working_hdr_id, po_working_imp_hdr_id, last_status_id, i_status_last, c_status_last, c_code_ref, c_detail, parent_id, i_import, c_comment, i_enable, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update, i_zzz, dc_user_del_id, dc_user_del_cost_id, d_del)
			SELECT po_working_hdr_id, po_working_imp_hdr_id, last_status_id, i_status_last, c_status_last, c_code_ref, c_detail, parent_id, i_import, c_comment, i_enable, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update, i_zzz, @dc_user_del_id AS dc_user_del_id, @dc_user_del_cost_id AS dc_user_del_cost_id, @d_del AS d_del
			FROM po_working_hdr WHERE po_working_hdr_id = @id;

			INSERT INTO po_working_dtl_del (po_working_dtl_id, po_working_hdr_id, dc_cost_id, dc_cost_ref_id, dc_expense_budget_type_id, d_audit_date, c_code, c_code_invoice, c_approve, d_approve_date, d_doc_date, d_inv_date, po_creditor_id, po_creditor_transfer_id, c_cnt_name, i_budget_year, i_budget_year_overlap, bg_expense_id, bg_budget_dtl_overlap_id, c_booking, c_detail, c_qty, f_total, f_return, po_emp_id, dc_approve_id, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update, dc_user_del_id, dc_user_del_cost_id, d_del, i_success, i_protest, i_close_receive, i_quick, i_sav_by_sys, i_zzz)
			SELECT po_working_dtl_id, po_working_hdr_id, dc_cost_id, dc_cost_ref_id, dc_expense_budget_type_id, d_audit_date, c_code, c_code_invoice, c_approve, d_approve_date, d_doc_date, d_inv_date, po_creditor_id, po_creditor_transfer_id, c_cnt_name, i_budget_year, i_budget_year_overlap, bg_expense_id, bg_budget_dtl_overlap_id, c_booking, c_detail, c_qty, f_total, f_return, po_emp_id, dc_approve_id, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update, @dc_user_del_id AS dc_user_del_id, @dc_user_del_cost_id AS dc_user_del_cost_id, @d_del AS d_del, i_success, i_protest, i_close_receive, i_quick, i_sav_by_sys, i_zzz
			FROM po_working_dtl WHERE po_working_hdr_id = @id;

			INSERT INTO po_working_item_del (po_working_item_id, po_working_hdr_id, po_status_hdr_id, i_status, c_status, c_name, d_doc_date, d_receive_date, c_code_ref, i_enable, c_comment, i_is_url_pdf_hdr, i_is_url_pdf_dtl, c_url_pdf_hdr, c_url_pdf_dtl, c_file_pdf_hdr, c_file_pdf_dtl, c_file_pdf_pay, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update, i_zzz, po_parcel_officer_id, po_reason_protest_id_s, dc_user_del_id, dc_user_del_cost_id, d_del)
			SELECT po_working_item_id, po_working_hdr_id, po_status_hdr_id, i_status, c_status, c_name, d_doc_date, d_receive_date, c_code_ref, i_enable, c_comment, i_is_url_pdf_hdr, i_is_url_pdf_dtl, c_url_pdf_hdr, c_url_pdf_dtl, c_file_pdf_hdr, c_file_pdf_dtl, c_file_pdf_pay, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update, i_zzz, po_parcel_officer_id, po_reason_protest_id_s, @dc_user_del_id as dc_user_del_id, @dc_user_del_cost_id as dc_user_del_cost_id, @d_del as d_del
			FROM po_working_item WHERE po_working_hdr_id = @id;

			DELETE FROM dbo.po_working_hdr WHERE po_working_hdr_id = @id;
			DELETE FROM dbo.po_working_dtl WHERE po_working_hdr_id = @id;
			DELETE FROM dbo.po_working_item WHERE po_working_hdr_id = @id;";

        $arrParam[] = $_REQUEST["id"];
        $arrParam[] = $_SESSION["user_id"];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = date("Y-m-d H:i:s");

        $stmt = $db->QueryParam($sql, $arrParam);

        $db->logs(
                "sp_Tor",
                $mode,
                $keyName,
                $_REQUEST["id"],
                $sql,
                $arrParam,
                $_SESSION,
                $dirLog
        );

        $re = array(
            "success" => true,
            "msg" => "ลบข้อมูลใบขอเบิก " . $_POST['c_code_ref'] . " เรียบร้อย"
        );
        break;

    case "SAVE_DTL":

        $sql = "";
        $Arr = json_decode($_REQUEST["data"], true);
        foreach ($Arr as $flds) {

            $data["d_doc_date"] = $flds["d_doc_date"];
            $data["d_receive_date"] = $flds["d_receive_date"];
            $data["c_comment"] = $flds["c_comment"];

            // $data["dc_user_update_id"]			= $_SESSION["user_id"];
            // $data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
            // $data["d_update"]					= date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld} = ?";
            }

            $arrValue[] = $flds["id"];
            $sql = "UPDATE po_working_item SET " . substr($addField, 1) . " WHERE po_working_hdr_id = {$_REQUEST["id"]} AND po_working_item_id = ?;";
            $db->QueryParam($sql, $arrValue);
            // ============== //
            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
            // ============== //

            if ($flds["i_status"] == 4) { // อนุมัติฏีกา
                $data["d_approve_date"] = $flds["d_doc_date"];

                foreach ($data as $fld => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fld} = ?";
                }

                $sql = "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = {$_REQUEST["id"]};";
                $db->QueryParam($sql, $arrValue);
                // ============== //
                $addField = null;
                $addValue = null;
                unset($data);
                unset($arrValue);
                // ============== //
            }
        }
        $re = array(
            "success" => true,
            "msg" => "บันทึกข้อมูลเรียบร้อย"
        );

        break;
    case "CHANGE_STATUS":

        $sql = "
			DECLARE @po_working_hdr_id AS BIGINT;
			DECLARE @i_status AS TINYINT;

			SET @po_working_hdr_id = ?;
			SET @i_status = ?;

			UPDATE a
				SET a.i_status_last = b.i_status
					,a.c_status_last = b.c_status
			FROM po_working_hdr a
			INNER JOIN po_working_item b ON a.po_working_hdr_id = b.po_working_hdr_id
			WHERE b.po_working_hdr_id = @po_working_hdr_id AND b.i_status = @i_status;
			";

        $arrParam[] = $_REQUEST["id"];
        $arrParam[] = $_REQUEST["i_status"];

        $db->QueryParam($sql, $arrParam);

        $re = array(
            "success" => true,
            "msg" => "บันทึกข้อมูลเรียบร้อย"
        );

        break;
    case "DELETE_STATUS_ITEM":

        $sql = "
			DECLARE @po_working_hdr_id AS BIGINT;
			DECLARE @i_status AS TINYINT;

			SET @po_working_hdr_id = ?;
			SET @i_status = ?;

			INSERT INTO po_working_item_del (
				po_working_item_id
				,po_working_hdr_id
				,po_status_hdr_id
				,i_status
				,c_status
				,c_name
				,d_doc_date
				,d_receive_date
				,c_code_ref
				,i_enable
				,c_comment
				,i_is_url_pdf_hdr
				,i_is_url_pdf_dtl
				,c_url_pdf_hdr
				,c_url_pdf_dtl
				,c_file_pdf_hdr
				,c_file_pdf_dtl
				,c_file_pdf_pay
				,dc_user_create_id
				,dc_user_create_cost_id
				,d_create
				,dc_user_update_id
				,dc_user_update_cost_id
				,d_update
				,i_zzz
				,po_parcel_officer_id
				,po_reason_protest_id_s
				,dc_user_del_id
				,dc_user_del_cost_id
				,d_del
			)
			SELECT po_working_item_id
				,po_working_hdr_id
				,po_status_hdr_id
				,i_status
				,c_status
				,c_name
				,d_doc_date
				,d_receive_date
				,c_code_ref
				,i_enable
				,c_comment
				,i_is_url_pdf_hdr
				,i_is_url_pdf_dtl
				,c_url_pdf_hdr
				,c_url_pdf_dtl
				,c_file_pdf_hdr
				,c_file_pdf_dtl
				,c_file_pdf_pay
				,dc_user_create_id
				,dc_user_create_cost_id
				,d_create
				,dc_user_update_id
				,dc_user_update_cost_id
				,d_update
				,i_zzz
				,po_parcel_officer_id
				,po_reason_protest_id_s
				,? AS dc_user_del_id
				,? AS dc_user_del_cost_id
				,? AS d_del
			FROM po_working_item
			WHERE po_working_hdr_id = @po_working_hdr_id AND i_status > @i_status;

			UPDATE a
				SET a.i_status_last = b.i_status
					,a.c_status_last = b.c_status
			FROM po_working_hdr a
			INNER JOIN po_working_item b ON a.po_working_hdr_id = b.po_working_hdr_id
			WHERE b.po_working_hdr_id = @po_working_hdr_id AND b.i_status = @i_status;

			UPDATE po_working_dtl SET i_success = 0 WHERE po_working_hdr_id = @po_working_hdr_id;

			DELETE po_working_item
			WHERE po_working_hdr_id = @po_working_hdr_id AND i_status > @i_status;";

        $arrParam[] = $_REQUEST["id"];
        $arrParam[] = $_REQUEST["i_status"];
        $arrParam[] = $_SESSION["user_id"];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = date("Y-m-d H:i:s");

        $db->QueryParam($sql, $arrParam);

        $re = array(
            "success" => true,
            "msg" => "บันทึกข้อมูลเรียบร้อย"
        );

        break;
    case "clear_type":

        $data["cm_pay_type_id"] = null;
        $data["i_pay_outside"] = null;

        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld} = ?";
        }

        $arrValue[] = $_REQUEST["id"];
        $arrValue[] = $_REQUEST["id"];
        $sql = "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?;
						DELETE po_working_cheque WHERE po_working_hdr_id = ?;";
        $para = $db->QueryParam($sql, $arrValue);

        $id = $_REQUEST["id"];

        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        if (@$para) {
            $re = array(
                "success" => true,
                "id" => $id,
                "msg" => "บันทึกข้อมูลเรียบร้อย"
            );
        } else {
            $re = array(
                "success" => false,
                "msg" => $msg
            );
        }
        break;
}
echo json_encode($re);
exit;
