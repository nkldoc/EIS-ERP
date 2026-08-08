<?php
include("../conf/configPo.php");
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db        = new DatabaseServer();
$date     = new i_date();

$root        = "data";
$data        = array();

$mode        = $_REQUEST["mode"];
$arrParam    = array();
$addField    = null;
$addValue    = null;
$arrValue    = array();
$uploaddir = PATH_PO_WORKING_PDF; //โฟเดอร์อัพโหลด pdf
// echo $uploaddir ; exit;
// print_r($_REQUEST["i_status"]);
// print_r($_POST);
// exit;

switch ($mode) {
    case "SEND_STATUS_UPLOADFILE":
        $msg    = "";
        if ($_FILES['upload_pdf1']['name'] != "") {
            $uploadfile = $uploaddir . basename($_REQUEST["id"] . '_' . $_REQUEST["i_status"] . '_hdr.pdf');
            if (move_uploaded_file($_FILES['upload_pdf1']['tmp_name'], $uploadfile) == false) {
                $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : ไม่สามารถอัพโหลดไฟล์ pdf");
                echo json_encode($re);
                exit;
            }
            $re = array(
                "success"                    => true,
                "msg"                        => $msg
            );
        } else {
            $re = array(
                "success"                    => true,
                "msg"                        => "ไม่มีการอัพโหลดไฟล์"
            );
        }
        break;

    case "SEND_RECEIVE_UPLOADFILE":
        $msg    = "";
        if ($_FILES['upload_pdf1']['name'] != "" && $_FILES['upload_pdf2']['name'] != "") {
            $uploadfile = $uploaddir . basename($_REQUEST["id"] . '_' . $_REQUEST["i_status"] . '_hdr.pdf');
            if (move_uploaded_file($_FILES['upload_pdf1']['tmp_name'], $uploadfile) == false) {
                $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : ไม่สามารถอัพโหลดไฟล์ pdf");
                echo json_encode($re);
                exit;
            }
            $uploadfile = $uploaddir . basename($_REQUEST["id"] . '_' . $_REQUEST["i_status"] . '_dtl.pdf');
            if (move_uploaded_file($_FILES['upload_pdf2']['tmp_name'], $uploadfile) == false) {
                $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : ไม่สามารถอัพโหลดไฟล์ pdf");
                echo json_encode($re);
                exit;
            }
            $re = array(
                "success"                    => true,
                "msg"                        => $msg
            );
        } else {
            $re = array(
                "success"                    => true,
                "msg"                        => "ไม่มีการอัพโหลดไฟล์"
            );
        }


        break;

    case "SEND_STATUS":

        $db->BeginTran();

        $msg    = "";
        $date_back = $db->GetDataBySQL("SELECT DATEDIFF(DAY, d_doc_date, '{$_REQUEST["d_doc_date"]}') FROM dbo.po_working_item WHERE po_working_hdr_id = {$_REQUEST["id"]} AND i_status = ?;", array($_REQUEST["i_status"] - 1));
        if (!$date_back) {
            $date_back = $db->GetDataBySQL("SELECT DATEDIFF(DAY, d_doc_date, '{$_REQUEST["d_doc_date"]}') FROM dbo.po_working_item WHERE po_working_hdr_id = {$_REQUEST["id"]} AND i_status = ?;", array($_REQUEST["i_status"] - 2));
        }
        if ($date_back >= 0) {
            if ($_REQUEST["i_status"] == 3) { //ทักท้วง

                // =========================== UPDATE STATUS HDR =========================== //
                $data["i_status_last"]                            = $_REQUEST["i_status"];
                $data["c_status_last"]                            = $CONF_I_STATUS[$_REQUEST["i_status"]];
                $data["dc_user_update_id"]                        = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"]                   = $_SESSION["dc_cost_id"];
                $data["d_update"]                                 = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ",
                    {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "UPDATE po_working_hdr SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                $para       = $db->QueryParam($sql, $arrValue);
                $id         = $_REQUEST["id"];

                $msg = $CONF_I_STATUS[$_REQUEST["i_status"]] . "เรียบร้อย";

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

                // =========================== UPDATE STATUS DTL =========================== //
                $data["i_protest"]                              = $db->GetDataBySQL("SELECT ISNULL(aa.i_protest,0) + 1 FROM dbo.po_working_dtl aa WHERE aa.po_working_hdr_id = ?;", array($_REQUEST["id"]));
                $data["dc_user_update_id"]                      = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"]                 = $_SESSION["dc_cost_id"];
                $data["d_update"]                               = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                $para        = $db->QueryParam($sql, $arrValue);

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

            } else if ($_REQUEST["i_status"] == 4) { // อนุมัติฏีกา

                // =========================== UPDATE STATUS HDR =========================== //
                $data["i_status_last"]                            = $_REQUEST["i_status"];
                $data["c_status_last"]                            = $CONF_I_STATUS[$_REQUEST["i_status"]];
                $data["dc_user_update_id"]                        = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"]                   = $_SESSION["dc_cost_id"];
                $data["d_update"]                                 = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "UPDATE po_working_hdr SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                $para       = $db->QueryParam($sql, $arrValue);
                $id         = $_REQUEST["id"];

                $msg = $CONF_I_STATUS[$_REQUEST["i_status"]] . "เรียบร้อย";

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

                // =========================== UPDATE STATUS DTL =========================== //
                $data["c_approve"]                              = $_REQUEST["c_approve"];
                $data["d_approve_date"]                         = $_REQUEST["d_doc_date"];
                $data["dc_user_update_id"]                      = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"]                 = $_SESSION["dc_cost_id"];
                $data["d_update"]                               = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                $para        = $db->QueryParam($sql, $arrValue);

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //
            } else if ($_REQUEST["i_status"] == 5) { // หักงบประมาณ

                // =========================== UPDATE STATUS HDR =========================== //
                $data["c_comment"]                            = $_REQUEST["c_comment1"];
                if ($_REQUEST["i_status_last"] < 5) {
                    $data["i_status_last"]                            = $_REQUEST["i_status"];
                    $data["c_status_last"]                            = $CONF_I_STATUS[$_REQUEST["i_status"]];
                }
                $data["dc_user_update_id"]                        = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"]                   = $_SESSION["dc_cost_id"];
                $data["d_update"]                                 = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "UPDATE po_working_hdr SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                $para       = $db->QueryParam($sql, $arrValue);
                $id         = $_REQUEST["id"];

                $msg = $CONF_I_STATUS[$_REQUEST["i_status"]] . "เรียบร้อย";

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

                // =========================== UPDATE STATUS DTL =========================== //                
                $data["bg_budget_dtl_overlap_id"]               = $_REQUEST["bg_budget_dtl_overlap_id"];
                $data["c_booking"]                              = $db->GetDataBySQL("SELECT c_code_ref FROM bg_budget_dtl_overlap WHERE bg_budget_dtl_overlap_id = ?", array($_REQUEST["bg_budget_dtl_overlap_id"]));
                $data["bg_expense_id"]                          = $_REQUEST["bg_expense_id"];
                $data["dc_user_update_id"]                      = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"]                 = $_SESSION["dc_cost_id"];
                $data["d_update"]                               = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                $para        = $db->QueryParam($sql, $arrValue);

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

            } else if ($_REQUEST["i_status"] == 11) { // จัดทำเช็ค

                // =========================== UPDATE STATUS DTL =========================== //
                $data["i_success"]                              = 1;
                $data["i_close_receive"]                        = $_REQUEST["i_close_receive"];
                $data["dc_user_update_id"]                      = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"]                 = $_SESSION["dc_cost_id"];
                $data["d_update"]                               = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                $para        = $db->QueryParam($sql, $arrValue);

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

            }

            $po_working_item_id = $db->GetDataBySQL("SELECT po_working_item_id FROM dbo.po_working_item WHERE po_working_hdr_id = {$_REQUEST["id"]} AND i_status = ?;", array($_REQUEST["i_status"]));

            $data["d_doc_date"]                                       = $_REQUEST["d_doc_date"];
            $data["c_comment"]                                        = $_REQUEST["c_comment"];
            if ($_REQUEST["i_status"] == 3) {
                $data["po_parcel_officer_id"]                             = $_REQUEST["po_parcel_officer_id"];
                $data["po_reason_protest_id_s"]                           = $_REQUEST["po_reason_protest_id_s"];
            }
            if ($_REQUEST["i_status"] == 5) {
                // $data["c_comment"]                                        = $_REQUEST["c_comment1"];
                $sql        = "UPDATE po_working_item SET c_comment = '{$_REQUEST["c_comment1"]}' WHERE po_working_hdr_id = {$_REQUEST["id"]} AND i_status in (1,2) ";
                $para = $db->QueryParam($sql, array());
            }
            $data["dc_user_update_id"]                                = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"]                           = $_SESSION["dc_cost_id"];
            $data["d_update"]                                         = date("Y-m-d H:i:s");
            // =========================== ITEM =========================== //
            if ($po_working_item_id > 0) { // EDIT

                $data["i_is_url_pdf_hdr"]                             = $_REQUEST["i_is_url_pdf_hdr"];
                $data["i_is_url_pdf_dtl"]                             = $_REQUEST["i_is_url_pdf_dtl"];
                if ($_REQUEST["i_is_url_pdf_hdr"] == null) {
                    $data["c_url_pdf_hdr"]                            = null;
                } else if ($_REQUEST["i_is_url_pdf_hdr"] == 0) {
                    $data["c_file_pdf_hdr"]                           = $_REQUEST["pdf_hdr"];
                } else if ($_REQUEST["i_is_url_pdf_hdr"] == 1) {
                    $data["c_url_pdf_hdr"]                            = $_REQUEST["pdf_hdr"];
                }

                if ($_REQUEST["i_is_url_pdf_dtl"] == 0) {
                    $data["c_file_pdf_dtl"]                           = $_REQUEST["pdf_dtl"];
                } else if ($_REQUEST["i_is_url_pdf_dtl"] == 1) {
                    $data["c_url_pdf_dtl"]                            = $_REQUEST["pdf_dtl"];
                }

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $po_working_item_id;
                $sql        = "UPDATE po_working_item SET " . substr($addField, 1) . " WHERE po_working_item_id = ?";
                $para = $db->QueryParam($sql, $arrValue);

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

                // =========================== UPDATE STATUS HDR =========================== //
                $data["dc_user_update_id"]                        = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"]                   = $_SESSION["dc_cost_id"];
                $data["d_update"]                                 = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "UPDATE po_working_hdr SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                $para        = $db->QueryParam($sql, $arrValue);
                $id            = $_REQUEST["id"];

                $msg = "แก้ไขเรียบร้อย";
            } else { // ADD

                $data["i_is_url_pdf_hdr"]                             = $_REQUEST["i_is_url_pdf_hdr"];
                $data["i_is_url_pdf_dtl"]                             = $_REQUEST["i_is_url_pdf_dtl"];
                if ($_REQUEST["i_is_url_pdf_hdr"] == null) {
                    $data["c_url_pdf_hdr"]                            = null;
                } else if ($_REQUEST["i_is_url_pdf_hdr"] == 0) {
                    $data["c_file_pdf_hdr"]                           = $_REQUEST["pdf_hdr"];
                } else if ($_REQUEST["i_is_url_pdf_hdr"] == 1) {
                    $data["c_url_pdf_hdr"]                            = $_REQUEST["pdf_hdr"];
                }


                if ($_REQUEST["i_is_url_pdf_dtl"] == 0) {
                    $data["c_file_pdf_dtl"]                           = $_REQUEST["pdf_dtl"];
                } else if ($_REQUEST["i_is_url_pdf_dtl"] == 1) {
                    $data["c_url_pdf_dtl"]                            = $_REQUEST["pdf_dtl"];
                }

                $data["po_working_hdr_id"]                      = $_REQUEST["id"];
                $data["i_status"]                               = $_REQUEST["i_status"];
                $data["c_status"]                               = $CONF_I_STATUS[$_REQUEST["i_status"]];
                $data["dc_user_create_id"]                      = $_SESSION["user_id"];
                $data["dc_user_create_cost_id"]                 = $_SESSION["dc_cost_id"];
                $data["d_create"]                               = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fld}";
                    $addValue .= ", ?";
                }

                $sql = "INSERT INTO po_working_item (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";

                $db->QueryParam($sql, $arrValue);

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

                // =========================== UPDATE STATUS HDR =========================== //
                $data["i_status_last"]                            = $_REQUEST["i_status"];
                $data["c_status_last"]                            = $CONF_I_STATUS[$_REQUEST["i_status"]];
                $data["dc_user_update_id"]                        = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"]                   = $_SESSION["dc_cost_id"];
                $data["d_update"]                                 = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "UPDATE po_working_hdr SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                $para        = $db->QueryParam($sql, $arrValue);
                $id            = $_REQUEST["id"];

                $msg = $CONF_I_STATUS[$_REQUEST["i_status"]] . "เรียบร้อย";
            }
        } else {
            $msg = "ไม่สามารถบันทึกวันที่ย้อนหลังได้";
        }
        if (@$para) {
            $db->CommitTran();
            $re = array(
                "success"                    => true,
                "msg"                        => $msg
            );
        } else {
            $db->RollBackTran();
            $re = array(
                "success"                    => false,
                "msg"                        => $msg
            );
        }

        break;

    case "SEND_RECEIVE": // รับคืนทักท้วง

        $db->BeginTran();

        $msg    = "";

        $date_back = $db->GetDataBySQL("SELECT DATEDIFF(DAY, d_doc_date, '{$_REQUEST["d_receive_date"]}') FROM dbo.po_working_item WHERE po_working_hdr_id = {$_REQUEST["id"]} AND i_status = ?;", array(3)); // รับใบเบิก
        if ($date_back >= 0) {

            $po_working_item_id = $db->GetDataBySQL("SELECT po_working_item_id FROM dbo.po_working_item WHERE po_working_hdr_id = {$_REQUEST["id"]} AND i_status = ?;", array(3));
            $data["i_is_url_pdf_hdr"]                                 = $_REQUEST["i_is_url_pdf_hdr"];
            $data["i_is_url_pdf_dtl"]                                 = $_REQUEST["i_is_url_pdf_dtl"];
            if ($_REQUEST["i_is_url_pdf_hdr"] == null) {
                $data["c_file_pdf_hdr"]                                = null;
                $data["c_url_pdf_hdr"]                                = null;
            } else if ($_REQUEST["i_is_url_pdf_hdr"] == 0) {
                $data["c_file_pdf_hdr"]                               = $_REQUEST["pdf_hdr"];
            } else if ($_REQUEST["i_is_url_pdf_hdr"] == 1) {
                $data["c_url_pdf_hdr"]                                = $_REQUEST["pdf_hdr"];
            }

            if ($_REQUEST["i_is_url_pdf_dtl"] == null) {
                $data["c_file_pdf_dtl"]                               = null;
                $data["c_url_pdf_dtl"]                                = null;
            } else if ($_REQUEST["i_is_url_pdf_dtl"] == 0) {
                $data["c_file_pdf_dtl"]                               = $_REQUEST["pdf_dtl"];
            } else if ($_REQUEST["i_is_url_pdf_dtl"] == 1) {
                $data["c_url_pdf_dtl"]                                = $_REQUEST["pdf_dtl"];
            }
            $data["d_receive_date"]                                   = $_REQUEST["d_receive_date"];
            $data["c_comment"]                                        = $_REQUEST["c_comment"];
            $data["dc_user_update_id"]                                = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"]                           = $_SESSION["dc_cost_id"];
            $data["d_update"]                                         = date("Y-m-d H:i:s");
            // =========================== ITEM =========================== //

            foreach ($data as $fld => $value) {
                $arrValue[]    = ($value != "") ? $value : null;
                $addField    .= ", {$fld} = ?";
            }

            $arrValue[] = $po_working_item_id;
            $sql        = "UPDATE po_working_item SET " . substr($addField, 1) . " WHERE po_working_item_id = ?";
            $para = $db->QueryParam($sql, $arrValue);

            // ============== //
            $addField    = null;
            $addValue    = null;
            unset($data);
            unset($arrValue);
            // ============== //

            // =========================== UPDATE STATUS HDR =========================== //
            $po_working_item_id = $db->GetDataBySQL("SELECT po_working_item_id FROM dbo.po_working_item WHERE po_working_hdr_id = {$_REQUEST["id"]} AND i_status = ?;", array(3));

            if ($po_working_item_id > 0) {
                $data["i_status_last"]                            = 2;
                $data["c_status_last"]                            = $CONF_I_STATUS[2];
                $data["dc_user_update_id"]                        = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"]                   = $_SESSION["dc_cost_id"];
                $data["d_update"]                                 = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "UPDATE po_working_hdr SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                $para        = $db->QueryParam($sql, $arrValue);
                $id            = $_REQUEST["id"];
            }

            $msg = $CONF_I_STATUS[$_REQUEST["i_status"]] . "เรียบร้อย";

            // ============== //
            $addField    = null;
            $addValue    = null;
            unset($data);
            unset($arrValue);
            // ============== //
        } else {
            $msg = "ไม่สามารถบันทึกวันที่ย้อนหลังได้";
        }

        if (@$para) {
            $db->CommitTran();
            $re = array(
                "success"                    => true,
                "msg"                        => $msg
            );
        } else {
            $db->RollBackTran();
            $re = array(
                "success"                    => false,
                "msg"                        => $msg
            );
        }

        break;

    case "SAVE_CHEQUE":

        $db->BeginTran();

        if ($_REQUEST["i_cheque"] == 1) {
            $po_working_cheque_id = $db->GetDataBySQL("SELECT po_working_cheque_id FROM dbo.po_working_cheque WHERE po_working_hdr_id = {$_REQUEST["po_working_hdr_id"]} AND c_cheque = ?;", array($_REQUEST["c_cheque"]));

            $data["c_creditor"]                         = $_REQUEST["c_creditor"];
            $data["c_cheque"]                           = $_REQUEST["c_cheque"];
        } else if ($_REQUEST["i_cheque"] == 2) {
            $data["c_creditor"]                         = "ภาษีบริษัท";
            $data["c_cheque"]                           = "";
        } else if ($_REQUEST["i_cheque"] == 3) {
            $data["c_creditor"]                         = "ประกันสังคม";
            $data["c_cheque"]                           = "";
        }
        $data["i_cheque"]                           = $_REQUEST["i_cheque"];
        $data["f_total"]                            = $_REQUEST["f_total"];
        $data["c_comment"]                          = $_REQUEST["c_comment"];
        $data["dc_user_update_id"]                  = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"]             = $_SESSION["dc_cost_id"];
        $data["d_update"]                           = date("Y-m-d H:i:s");

        if (@$po_working_cheque_id > 0) {

            foreach ($data as $fld => $value) {
                $arrValue[]    = ($value != "") ? $value : null;
                $addField    .= ", {$fld} = ?";
            }

            $arrValue[] = $po_working_cheque_id;
            $sql = "UPDATE po_working_cheque SET " . substr($addField, 1) . " WHERE po_working_cheque_id = ?";
            $para = $db->QueryParam($sql, $arrValue);
            $msg = "แก้ไขรายการเรียบร้อย";
        } else {

            $data["po_working_hdr_id"]                      = $_REQUEST["po_working_hdr_id"];
            $data["dc_user_create_id"]                      = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"]                 = $_SESSION["dc_cost_id"];
            $data["d_create"]                               = date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }

            $sql = "
                SET NOCOUNT ON
                INSERT INTO po_working_cheque (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";

            $para    = $db->QueryParam($sql, $arrValue);
            $msg = "เพิ่มรายการเรียบร้อย";
        }

        // =========================================================== //
        if (@$para) {
            $db->CommitTran();
            $re = array(
                "success"                    => true,
                "msg"                        => $msg
            );
        } else {
            $db->RollBackTran();
            $re = array(
                "success"                    => false,
                "msg"                        => $msg
            );
        }
        echo json_encode($re);
        exit;
        break;

    case "SAVE_CHEQUE_CONFIRM":

        $db->BeginTran();

        $data["i_status"]                           = $_REQUEST["i_status"];
        $data["dc_user_update_id"]                  = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"]             = $_SESSION["dc_cost_id"];
        $data["d_update"]                           = date("Y-m-d H:i:s");

        foreach ($data as $fld => $value) {
            $arrValue[]    = ($value != "") ? $value : null;
            $addField    .= ", {$fld} = ?";
        }

        $arrValue[] = $_REQUEST["id"];
        $sql = "UPDATE po_working_cheque SET " . substr($addField, 1) . " WHERE po_working_cheque_id = ?";
        $para = $db->QueryParam($sql, $arrValue);
        $db->CommitTran();
        $re = array(
            "success"        => true,
            "msg"            => "แก้ไขรายการเรียบร้อย"
        );

        break;

    case "DELETE_CHEQUE":

        $db->BeginTran();
        $db->QueryParam("DELETE po_working_cheque WHERE po_working_cheque_id = ?;", array($_REQUEST["id"]));
        $db->CommitTran();
        $re = array(
            "success"        => true,
            "msg"            => "ลบรายการเรียบร้อย"
        );

        break;
}
echo json_encode($re);
exit;
