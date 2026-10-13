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
//End fn updateStaus
$db->BeginTran();
$d_tor_date = $data['d_tor_date'] ?? null;
$data['d_tor_date'] = !empty($d_tor_date) ? $date->bc_to_ad($data['d_tor_date']) : null;
$f_total_amt = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0; //str_replace(',', '', $data[$value]);
$data['dc_cost_id'] = $data['dc_cost_id'] ?? 38;
$data["c_comment"] = $data["c_comment"] ?? NULL;
switch ($mode) {

    case "DC_EXPENSE_BUDGET_IN_TOR":
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;
        $sqlMain = "
                DECLARE  @dc_expense_budget_type_id INT
                DECLARE  @sp_tor_contract_id INT
                   SET @dc_expense_budget_type_id = ?
                   SET @sp_tor_contract_id = ?

                   SELECT
                       a.dc_expense_budget_type_id
                       ,(SELECT c_name FROM dc_expense_budget_type aa WHERE aa.dc_expense_budget_type_id = a.dc_expense_budget_type_id) AS c_dc_expense_budget_type
                       ,isnull(f_type_amt,0) - isnull(b.f_month_total_use,0) as f_type_amt
                   FROM (
                       SELECT
                           dc_expense_budget_type_id
                           ,f_type_amt
                       FROM sp_tor
                       WHERE tor_id = @dc_expense_budget_type_id
                       UNION all
                       SELECT
                           dc_expense_budget_type2_id
                           ,f_type2_amt
                       FROM sp_tor
                       WHERE tor_id = @dc_expense_budget_type_id
                       UNION all
                       SELECT
                           dc_expense_budget_type3_id
                           ,f_type3_amt
                       FROM sp_tor
                       WHERE tor_id = @dc_expense_budget_type_id
                       UNION all
                       SELECT
                           dc_expense_budget_type4_id
                           ,f_type4_amt
                       FROM sp_tor
                       WHERE tor_id = @dc_expense_budget_type_id
                       UNION all
                       SELECT
                           dc_expense_budget_type5_id
                           ,f_type5_amt
                       FROM sp_tor
                       WHERE tor_id = @dc_expense_budget_type_id
                   )a
                   left join (
                       select
                           dc_expense_budget_type_id ,
                           sum(f_dr) as f_month_total_use
                       from sp_gl_monthly_hdr bb1
                       inner join sp_gl_monthly_dtl bb2 on bb1.sp_gl_monthly_hdr_id = bb2.sp_gl_monthly_hdr_id
                       where bb1.sp_tor_id = @dc_expense_budget_type_id and bb1.sp_tor_contract_id != @sp_tor_contract_id and bb2.dc_expense_budget_type_id is not null
                       group by dc_expense_budget_type_id
                   ) b on a.dc_expense_budget_type_id =b.dc_expense_budget_type_id
                   where a.dc_expense_budget_type_id IS NOT NULL AND a.dc_expense_budget_type_id > 0";

        $arrParam = array($_REQUEST["sp_tor_id"], $_REQUEST["sp_tor_contract_id"]);

        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if ($stmt) {

            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "id" => "{$row["dc_expense_budget_type_id"]}",
                    "c_name" => "{$row["c_dc_expense_budget_type"]}",
                    "f_total" => "{$row["f_type_amt"]}"
                );
                ${$root}[] = $temp;
            }
        }
        echo json_encode(array("debug" => true, $root => ${$root}));
        exit();
        break;
        case "DC_EXPENSE_BUDGET_IN_TOR_GL":
            $root = "data";
            $data = array();
            $temp = array();
            $con = null;
            $sqlMain = "
                    DECLARE  @dc_expense_budget_type_id INT
                    DECLARE  @sp_tor_contract_id INT
                       SET @dc_expense_budget_type_id = ?
                       SET @sp_tor_contract_id = ?
    
                       SELECT
                           a.dc_expense_budget_type_id
                           ,(SELECT c_name FROM dc_expense_budget_type aa WHERE aa.dc_expense_budget_type_id = a.dc_expense_budget_type_id) AS c_dc_expense_budget_type
                           ,isnull(f_type_amt,0) - isnull(b.f_month_total_use,0) as f_type_amt
                       FROM (
                           SELECT
                               dc_expense_budget_type_id
                               ,f_type_amt
                           FROM sp_tor
                           WHERE tor_id = @dc_expense_budget_type_id
                           UNION all
                           SELECT
                               dc_expense_budget_type2_id
                               ,f_type2_amt
                           FROM sp_tor
                           WHERE tor_id = @dc_expense_budget_type_id
                           UNION all
                           SELECT
                               dc_expense_budget_type3_id
                               ,f_type3_amt
                           FROM sp_tor
                           WHERE tor_id = @dc_expense_budget_type_id
                           UNION all
                           SELECT
                               dc_expense_budget_type4_id
                               ,f_type4_amt
                           FROM sp_tor
                           WHERE tor_id = @dc_expense_budget_type_id
                           UNION all
                           SELECT
                               dc_expense_budget_type5_id
                               ,f_type5_amt
                           FROM sp_tor
                           WHERE tor_id = @dc_expense_budget_type_id
                       )a
                       left join (
                           select
                               dc_expense_budget_type_id ,
                               sum(f_dr) as f_month_total_use
                           from sp_gl_monthly_hdr bb1
                           inner join sp_gl_monthly_dtl bb2 on bb1.sp_gl_monthly_hdr_id = bb2.sp_gl_monthly_hdr_id
                           where bb1.sp_tor_id = @dc_expense_budget_type_id and bb1.sp_tor_contract_id != @sp_tor_contract_id and bb2.dc_expense_budget_type_id is not null
                           group by dc_expense_budget_type_id
                       ) b on a.dc_expense_budget_type_id =b.dc_expense_budget_type_id
                       where a.dc_expense_budget_type_id IS NOT NULL AND a.dc_expense_budget_type_id > 0";
    
            $arrParam = array($_REQUEST["sp_tor_id"], $_REQUEST["sp_tor_contract_id"]);
    
            $stmt = $db->QueryParam($sqlMain, $arrParam);
            if ($stmt) {
    
                while ($row = $db->Fetch($stmt)) {
                    $temp = array(
                        "id" => "{$row["dc_expense_budget_type_id"]}",
                        "c_name" => "{$row["c_dc_expense_budget_type"]}",
                        "f_total" => "{$row["f_type_amt"]}",
                        "gl_sp_dc_hdr_id" => 26
                    );
                    ${$root}[] = $temp;
                }
            }
            echo json_encode(array("debug" => true, $root => ${$root}));
            exit();
            break;
    case "SP_GL_MONTHLY_HDR":
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;
        $sqlMain = "SELECT
                        sp_gl_monthly_hdr_id
                        ,sp_tor_id
                        ,sp_tor_contract_id
                        ,i_month_total
                        ,f_total
                        ,CONVERT(VARCHAR, d_doc_date, 120) AS d_doc_date
                        ,dc_acc_id
                        ,(SELECT c_code + ' ' + c_name FROM NMU_ERP..dc_acc aa WHERE aa.dc_acc_id = a.dc_acc_id) AS c_dc_acc
                        ,dc_cost_id
                        ,c_comment
                        ,i_enabled
                        ,dc_user_create_id
                        ,dc_user_create_cost_id
                        ,d_create
                        ,dc_user_update_id
                        ,dc_user_update_cost_id
                        ,d_update
                    FROM sp_gl_monthly_hdr a WHERE sp_tor_id = ? AND sp_tor_contract_id = ?";
        $arrParam = array($_REQUEST["sp_tor_id"], $_REQUEST["sp_tor_contract_id"]);
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if ($stmt) {
            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "sp_gl_monthly_hdr_id" => $row["sp_gl_monthly_hdr_id"],
                    "sp_tor_id" => $row["sp_tor_id"],
                    "sp_tor_contract_id" => $row["sp_tor_contract_id"],
                    "i_month_total" => $row["i_month_total"],
                    "f_total" => $row["f_total"],
                    "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                    "dc_acc_id" => $row["dc_acc_id"],
                    "c_dc_acc" => $row["c_dc_acc"],
                    "dc_cost_id" => $row["dc_cost_id"],
                    "c_comment" => $row["c_comment"],
                    "i_enabled" => $row["i_enabled"],
                    "dc_user_create_id" => $row["dc_user_create_id"],
                    "dc_user_create_cost_id" => $row["dc_user_create_cost_id"],
                    "d_create" => $row["d_create"],
                    "dc_user_update_id" => $row["dc_user_update_id"],
                    "dc_user_update_cost_id" => $row["dc_user_update_cost_id"],
                    "d_update" => $row["d_update"],
                );
                ${$root}[] = $temp;
            }
        }
        echo json_encode(array("debug" => true, $root => ${$root}));
        exit();
        break;
    case "LIST_SP_GL_MONTHLY_DTL":
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;
        $sqlMain = "SELECT
                        sp_gl_monthly_dtl_id
                        ,sp_gl_monthly_hdr_id
                        ,i_month
                        ,i_period
                        ,gl_sp_dc_hdr_id
                        ,gl_sp_bg_hdr_id
                        ,sp_tor_hdr_period_id
                        ,dc_expense_budget_type_id
                        ,dc_acc_id
                        ,dc_creditor_id
                        ,f_dr as f_month_total
                        ,c_comment
                        ,i_enabled
                        ,CONVERT(VARCHAR, d_date, 120) AS d_date 
                        ,dc_user_create_id
                        ,dc_user_create_cost_id
                        ,po_expense_id
                        
                        ,d_create
                        ,dc_user_update_id
                        ,dc_user_update_cost_id
                        ,d_update
                    FROM sp_gl_monthly_dtl
                    WHERE sp_gl_monthly_hdr_id = ? AND i_enabled = 1
                    ORDER BY i_month";
        $arrParam = array($_REQUEST["sp_gl_monthly_hdr_id"]);
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if ($stmt) {
            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "sp_gl_monthly_dtl_id" => $row["sp_gl_monthly_dtl_id"],
                    "sp_gl_monthly_hdr_id" => $row["sp_gl_monthly_hdr_id"],
                    "i_month" => $row["i_month"],
                    "i_period" => $row["i_period"],
                    "gl_sp_bg_hdr_id" => $row["gl_sp_bg_hdr_id"],
                    "gl_sp_dc_hdr_id" => $row["gl_sp_dc_hdr_id"],
                    "po_expense_id" => $row["po_expense_id"],
                    "sp_tor_hdr_period_id" => $row["sp_tor_hdr_period_id"],

                    "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                    "dc_acc_id" => $row["dc_acc_id"],
                    "dc_creditor_id" => $row["dc_creditor_id"],
                    "f_month_total" => $row["f_month_total"],
                    "c_comment" => $row["c_comment"],
                    "i_enabled" => $row["i_enabled"],
                    "d_doc_date" => $date->extDateBuddha($row["d_date"]),
                    "dc_user_create_id" => $row["dc_user_create_id"],
                    "dc_user_create_cost_id" => $row["dc_user_create_cost_id"],
                    "d_create" => $row["d_create"],
                    "dc_user_update_id" => $row["dc_user_update_id"],
                    "dc_user_update_cost_id" => $row["dc_user_update_cost_id"],
                    "d_update" => $row["d_update"],
                );
                ${$root}[] = $temp;
            }
        }
        echo json_encode(array("debug" => true, $root => ${$root}));
        exit();
        break;
    case "UP_SP_GL_MONTHLY":
    
        $arr = json_decode($data['data']);
    
        foreach($arr as $k => $v){  
            
            $arrValue[] = $v->sp_tor_hdr_period_id; 
            $arrValue[] = $v->i_period; 
            $arrValue[] = $data["dc_user_update_id"];
            $arrValue[] = $data["dc_user_update_cost_id"];
            $arrValue[] = $data["d_update"];
            $arrValue[] = $v->sp_gl_monthly_dtl_id;
            
            $sql = "UPDATE sp_gl_monthly_dtl SET sp_tor_hdr_period_id=? " 
                    . " , i_period = ? "
                    . " , dc_user_update_id = ? "
                    . " , dc_user_update_cost_id = ? "
                    . " , d_update= ? "
                    . " WHERE sp_gl_monthly_dtl_id = ?"; 
            /*
                echo $sql;
                print_r($arrValue);
                exit();
            */
            $stmt = $db->QueryParam($sql, $arrValue); 
             unset($arrValue);
        } 
    
       
        if ($stmt) {
            $db->CommitTran();
            $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $re_id);
        } else {
            $db->RollBackTran();
            $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
        }
        echo json_encode($re);
        exit;

        if ($_REQUEST["sp_gl_monthly_hdr_id"] > 0) {
            $id_dalete = "";
            $count_loop = 0;
            $Arr_delete_id = json_decode($_REQUEST["data"], true);
            foreach ($Arr_delete_id as $fldd_delete) {
                if ($fldd_delete["sp_gl_monthly_dtl_id"] > 0) {
                    $id_dalete .= "," . $fldd_delete["sp_gl_monthly_dtl_id"];
                    $count_loop++;
                }
            }
            $in_not = $count_loop > 0 ? " AND sp_gl_monthly_dtl_id NOT IN (" . substr($id_dalete, 1) . ")" : "";
            $sql = "DELETE sp_gl_monthly_dtl WHERE sp_gl_monthly_hdr_id = {$_REQUEST["sp_gl_monthly_hdr_id"]}" . $in_not;
            $stmt = $db->QueryParam($sql, array());
        }

        $root = "data";
        $data = array();
        $temp = array();
        $con = null;

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);

        $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        $data["sp_tor_hdr_period_id"] = $_REQUEST["sp_tor_hdr_period_id"];
        $data["i_period"] = $_REQUEST["i_period"];
        $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"];
        $data["c_ref_doc"] = $_REQUEST["c_doc_ref"];
        $data["i_month_total"] = $_REQUEST["i_month_total"];
        $data["i_month_total"] = $_REQUEST["i_month_total"];
        $data['d_doc_date'] = $_REQUEST['d_date_monthly_hdr'];
        $data["dc_acc_id"] = $_REQUEST["dc_acc_idID"];
        $data["dc_cost_id"] = $_REQUEST["dc_cost_id"];
        $data["f_total"] = str_replace(',', '', $_REQUEST["f_total"]);
        $data["i_enabled"] = 1;

        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        if (@$_REQUEST['sp_gl_monthly_hdr_id'] < 1) {  // ****** ADD ******
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ",
                {$fld}";
                $addValue .= ", ?";
            }

            $sql = "
                SET NOCOUNT ON
                INSERT INTO sp_gl_monthly_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";
            $stmt = $db->QueryParam($sql, $arrValue);
            $ss_id = $db->Fetch($stmt);
            $re_id = $ss_id["id"];
        } else if (@$_REQUEST['sp_gl_monthly_hdr_id'] > 0) { // ****** EDIT ******
            foreach ($data as $fldA => $value) {
                if ($data[''])
                    $arrValue[] = ($value != "") ? $value : null;
                $addField .= ",
                {$fldA} = ?";
            }
            print_r($_REQUEST);
            exit();
            $arrValue[] = $_REQUEST["sp_gl_monthly_hdr_id"] ?? null;
            $sql = "UPDATE sp_gl_monthly_hdr SET " . substr($addField, 1) . " WHERE sp_gl_monthly_hdr_id = ?";
            $re_id = $_REQUEST["sp_gl_monthly_hdr_id"];
            $stmt = $db->QueryParam($sql, $arrValue);
        }
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        $Arr = json_decode($_REQUEST["data"], true);
        foreach ($Arr as $fldd) {
            $data["i_month"] = $fldd["i_month"];
            $data["dc_acc_id"] = $fldd["dc_acc_id"];
            $data["dc_expense_budget_type_id"] = $fldd["dc_expense_budget_type_id"];
            $data["dc_creditor_id"] = $fldd["dc_creditor_id"];
            $data["f_dr"] = $fldd["f_month_total"];
            $data["d_date"] = $fldd["d_date"];
            $data["c_comment"] = $fldd["c_comment"];
            $data["i_enabled"] = 1;
            $data["dc_user_update_id"] = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");

            if ($fldd["sp_gl_monthly_dtl_id"] > 0) { // EDIT
                foreach ($data as $fldA => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ",
                    {$fldA} = ?";
                }

                $sql = "UPDATE sp_gl_monthly_dtl SET " . substr($addField, 1) . " WHERE sp_gl_monthly_dtl_id = ?";
                $arrValue[] = $fldd["sp_gl_monthly_dtl_id"];

                $db->QueryParam($sql, $arrValue);
            } else { // ADD
                $data["sp_gl_monthly_hdr_id"] = $re_id;
                $data["dc_user_create_id"] = $_SESSION["user_id"];
                $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
                $data["d_create"] = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ",
                    {$fld}";
                    $addValue .= ",
                    ?";
                }

                $sql = "
                            SET NOCOUNT ON
                            INSERT INTO sp_gl_monthly_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                            SELECT @@IDENTITY as id;";
                $para = $db->QueryParam($sql, $arrValue);
                $ss_id = $db->Fetch($para);
                $id = $ss_id["id"];

                // ============== //
                $addField = null;
                $addValue = null;
                unset($data);
                unset($arrValue);
                // ============== //
            }

            // ============== //
            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
            // ============== //
        }


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
