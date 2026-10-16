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
        // ค่า "ไม่มีการค้ำประกัน" (ข้อความ / 0 / ค่าว่าง) ให้เป็น NULL ทั้งหมด
        $i_is_book = ($i_is_book == '- ไม่มีการค้ำประกัน -' || $i_is_book === '0' || $i_is_book === 0 || $i_is_book === '') ? NULL : $i_is_book;
        $g = ($i_is_book === NULL) ? NULL : (string)$i_is_book; // '1'=เงินสด, '8'=แคชเชียร์เช็ค, '9'=หนังสือค้ำประกัน

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

        // เขียนเฉพาะข้อมูลของวิธีที่เลือก ที่เหลือ clear เป็น NULL เพื่อให้ป้ายวิธีการค้ำประกันบนหน้าจอตรงกับที่เลือก
        // --- เงินสด (1) ---
        $val_warranty = str_replace(",", "", $_REQUEST["f_warranty_amt"] ?? '');
        $arrParam["book_seq"] = ($g === '1') ? ($_REQUEST["c_receipt_no"] ?? null) : null;
        $arrParam["d_book_date"] = ($g === '1' && !empty($_REQUEST['d_book_date'])) ? $date->bc_to_ad($_REQUEST['d_book_date']) : null;
        $arrParam["f_warranty_amt"] = ($g === '1' && $val_warranty !== '' && $val_warranty != 0) ? $val_warranty : null;

        // --- หนังสือค้ำประกัน (9) ---
        $val_book_warranty = str_replace(",", "", $_REQUEST["f_warranty_amt1"] ?? '');
        $arrParam["book_warranty_no"] = ($g === '9') ? ($_REQUEST["c_doc_no"] ?? null) : null;
        $arrParam["d_book_warranty_date"] = ($g === '9' && !empty($_REQUEST['d_doc_date1'])) ? $date->bc_to_ad($_REQUEST['d_doc_date1']) : null;
        $arrParam["d_book_warranty_end"] = ($g === '9' && !empty($_REQUEST['d_expire_warranty'])) ? $date->bc_to_ad($_REQUEST['d_expire_warranty']) : null;
        $arrParam["f_book_warranty_amt"] = ($g === '9' && $val_book_warranty !== '' && $val_book_warranty != 0) ? $val_book_warranty : null;
        $arrParam["dc_bank_id"] = ($g === '9') ? ($_REQUEST["dc_bank_id"] ?? null) : null;

        // --- แคชเชียร์เช็ค (8) ---
        $val_warranty_cashiercheque = str_replace(",", "", $_REQUEST["f_cashiercheque_warranty_amt2"] ?? '');
        $arrParam['cashiercheque_on'] = ($g === '8') ? ($_REQUEST['c_receipt_cashiercheque'] ?? 1) : null;
        $arrParam['cashiercheque_seq'] = ($g === '8') ? ($_REQUEST['c_receipt_cashiercheque'] ?? null) : null;
        $arrParam["d_cashiercheque_data"] = ($g === '8' && !empty($_REQUEST['d_cashiercheque_date'])) ? $date->bc_to_ad($_REQUEST['d_cashiercheque_date']) : null;
        $arrParam['f_warranty_cashiercheque'] = ($g === '8' && $val_warranty_cashiercheque !== '' && $val_warranty_cashiercheque != 0) ? $val_warranty_cashiercheque : null;

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
            // ---- อ่านค่าเดิมก่อนแก้ไข ไว้เขียน audit log ----
            $__logOld = $db->GetDataBySQL(
                "SELECT CONVERT(varchar,d_doc_date,23) AS d_doc_date
                      , CONVERT(varchar,d_period_date,23) AS d_period_date
                      , f_total_amt, i_day, i_alert, i_is_last, c_discription
                   FROM dbo.sp_tor_hdr_period WHERE sp_tor_hdr_period_id = ?",
                array($_REQUEST["sp_tor_hdr_period_id"])
            );

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
            // $sql2 เป็น UPDATE ไม่มี result set จึงไม่ต้อง Fetch (เดิมเรียก Fetch แล้วอ่าน $ss_id["id"] ทำให้ PHP fatal / HTTP 500)
            $re_id = $_REQUEST["sp_tor_hdr_period_id"];
            $dc_creditor_name = $db->GetDataBySQL(
                "SELECT c.c_name FROM dbo.sp_tor_hdr_period p
                 INNER JOIN dbo.sp_tor_contract ct ON ct.sp_tor_contract_id = p.sp_tor_contract_id
                 LEFT JOIN NMU.dbo.dc_creditor c ON c.dc_creditor_id = ct.dc_creditor_id
                 WHERE p.sp_tor_hdr_period_id = ?",
                array($re_id)
            );
            $c_doc_ref_contract = $db->GetDataBySQL(
                "SELECT ct.c_code FROM dbo.sp_tor_hdr_period p
                 INNER JOIN dbo.sp_tor_contract ct ON ct.sp_tor_contract_id = p.sp_tor_contract_id
                 WHERE p.sp_tor_hdr_period_id = ?",
                array($re_id)
            );

            // ---- sync ยอดเงินงวดไปตาราง sp_check_period_dtl (หน้าตรวจรับ SUM f_net_total_price จากตรงนี้) ----
            //      ทำเฉพาะงวดที่ยังไม่ออกเลขตรวจรับ (sp_check_period_hdr.c_code IS NULL) เท่านั้น
            $d_update_chk = date("Y-m-d H:i:s");
            $db->QueryParam(
                "UPDATE d
                    SET d.f_net_unit_price = ?, d.f_net_total_price = ?,
                        d.dc_user_update_id = ?, d.dc_user_update_cost_id = ?, d.d_update = ?
                   FROM dbo.sp_check_period_dtl d
                   INNER JOIN dbo.sp_check_period_hdr h ON h.sp_check_period_hdr_id = d.sp_check_period_hdr_id
                  WHERE d.sp_tor_hdr_period_id = ? AND h.c_code IS NULL",
                array($f_total_amt, $f_total_amt, $_SESSION["user_id"], $_SESSION["dc_cost_id"], $d_update_chk, $re_id)
            );

            // ---- เขียน audit log เฉพาะฟิลด์ที่มีการเปลี่ยนแปลง ----
            $__logNew = array(
                "d_doc_date"    => $data['d_doc_date'],
                "d_period_date" => $data['d_period_date'],
                "f_total_amt"   => $data['f_total_amt'],
                "i_day"         => $data['i_day'],
                "i_alert"       => $data['i_alert'],
                "i_is_last"     => $data['i_is_last'],
                "c_discription" => $data['c_discription'],
            );
            $__logLabel = array(
                "d_doc_date"    => "วันที่เริ่มนับการส่งของในงวด",
                "d_period_date" => "วันที่กำหนดส่งในงวดงาน",
                "f_total_amt"   => "จำนวนเงินงวด",
                "i_day"         => "จำนวนวันที่กำหนดส่ง",
                "i_alert"       => "จำนวนวันแจ้งเตือน",
                "i_is_last"     => "งวดสุดท้าย",
                "c_discription" => "หมายเหตุ",
            );
            $__confirmed = (($_REQUEST['confirm_edit'] ?? '') == '1') ? 1 : 0;
            $__logUser = $_SESSION["user_id"] ?? 0;
            $__logDate = date("Y-m-d H:i:s");
            $__logContractId = $_REQUEST['sp_tor_contract_id'] ?? null;
            foreach ($__logNew as $__f => $__nv) {
                $__ov = $__logOld[$__f] ?? null;
                $__ovC = is_string($__ov) ? trim($__ov) : $__ov;
                $__nvC = is_string($__nv) ? trim($__nv) : $__nv;
                if (in_array($__f, array("d_doc_date", "d_period_date"))) {
                    $__ovC = substr((string)$__ovC, 0, 10);
                    $__nvC = substr((string)$__nvC, 0, 10);
                } elseif ($__f == "f_total_amt") {
                    $__ovC = number_format((float)$__ovC, 2, '.', '');
                    $__nvC = number_format((float)$__nvC, 2, '.', '');
                } else {
                    $__ovC = (string)$__ovC;
                    $__nvC = (string)$__nvC;
                }
                if ($__ovC === $__nvC) {
                    continue;
                }
                // ใช้ sqlsrv_query ตรง ๆ + ปิด error ไว้ เพื่อไม่ให้การเขียน log ล้ม ไปทำให้การบันทึกงวดพัง
                // (ถ้ายังไม่ได้สร้างตาราง sp_tor_hdr_period_edit_log การบันทึกงวดก็ยังทำงานปกติ แค่ไม่มี log)
                @sqlsrv_query(
                    $db->conn,
                    "INSERT INTO dbo.sp_tor_hdr_period_edit_log
                        (sp_tor_hdr_period_id, sp_tor_contract_id, c_contract_code, i_period,
                         field_name, field_label, old_value, new_value, i_confirmed, c_source, dc_user_id, d_create)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    array(
                        $re_id, $__logContractId, $c_doc_ref_contract, $i_period,
                        $__f, $__logLabel[$__f], (string)$__ovC, (string)$__nvC,
                        $__confirmed, 'ST0009', $__logUser, $__logDate
                    )
                );
            }

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
