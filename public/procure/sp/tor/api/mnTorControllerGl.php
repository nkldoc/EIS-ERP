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
    case "LIST_GL_CONF": 
        $root = "data";
        $data = array();
        $temp = array();
        $con = null; 
        if($_REQUEST['i_is_conf']==0){
        $sqlMain = "select gl_sp_bg_dtl_id
                        ,gl_sp_bg_hdr_id
                        ,gl_sp_dc_dtl_id
                        ,i_rank
                        ,i_type_dr_cr
                        , CASE
                                WHEN i_type_dr_cr = 1 THEN 'เดบิต'
                                WHEN i_type_dr_cr = 2 THEN 'เครดิต'
                                ELSE '-'
                            END AS c_type_dr_cr
                        , dc_acc_id
                        ,(select c_code from NMU..dc_acc where dc_acc_id=NMU.dbo.gl_sp_bg_dtl.dc_acc_id) as c_code
                        ,(select c_name from NMU..dc_acc where dc_acc_id=NMU.dbo.gl_sp_bg_dtl.dc_acc_id) as c_name 
                    from NMU.dbo.gl_sp_bg_dtl
                    where gl_sp_bg_hdr_id =?
                    order by i_rank
                    "; 
        $arrParam = array($_REQUEST['gl_sp_bg_hdr_id']);
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if ($stmt) {
            $arrType = array(1 => "เดบิต", 2 => "เครดิต");
            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "id" => $row["gl_sp_bg_dtl_id"],
                    "gl_sp_bg_dtl_id" => $row["gl_sp_bg_dtl_id"],
                    "gl_sp_bg_hdr_id" => $row["gl_sp_bg_hdr_id"],
                    "gl_sp_dc_dtl_id" => $row["gl_sp_dc_dtl_id"],
                    "i_rank" => $row["i_rank"],
                    "i_type_dr_cr" => $row["i_type_dr_cr"],
                    "c_type_dr_cr" => $row["c_type_dr_cr"],
                    "dc_acc_id" => $row["dc_acc_id"],  
                    "c_code" => $row["c_code"],
                    "c_name" => $row["c_name"], 
                );
                ${$root}[] = $temp;
            }
        } 
            echo json_encode(array("debug" => true, $root => ${$root}));
        }else{ 
            // select json_dr_cr from sp_gl_monthly_dtl where sp_gl_monthly_dtl_id = 1 
            $rsJson = $db->GetDataBySQL("select json_dr_cr from NMU_ERP.dbo.sp_gl_monthly_dtl where sp_gl_monthly_dtl_id = ?" , array($_REQUEST['sp_gl_monthly_dtl_id'])); 
            echo '{"debug":true,"data":'.$rsJson.'}';
            
        }
            
        exit();
        break;
    case "LIST_SP_GL_MONTHLY_DTL":
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;
        $sp_tor_id = $_REQUEST['sp_tor_id'] ; 
        // print_r ($con);
       /* $sqlMain = "SELECT
                        a.sp_gl_monthly_dtl_id
                        ,a.sp_gl_monthly_hdr_id
                        ,i_month
                        ,a.dc_expense_budget_type_id
                        ,a.dc_acc_id
                        ,a.gl_sp_dc_hdr_id
                        ,a.bg_expense_id
                        ,a.i_send_gl
                        ,a.dc_creditor_id
                        ,a.f_dr as f_month_total
                        ,a.c_comment
                        ,a.i_enabled
                        ,a.gl_sp_bg_hdr_id
                        ,a.po_expense_id
                        ,CONVERT(VARCHAR, a.d_date, 120) AS d_date
                        -- ,d_date
                        ,a.dc_user_create_id
                        ,a.dc_user_create_cost_id
                        ,a.d_create
                        ,a.dc_user_update_id
                        ,a.dc_user_update_cost_id
                        ,a.d_update
                    FROM sp_gl_monthly_dtl a
                    inner JOIN sp_gl_monthly_hdr b on a.sp_gl_monthly_hdr_id = b.sp_gl_monthly_hdr_id
                    WHERE a.sp_gl_monthly_hdr_id = ?  and b.sp_tor_id = {$sp_tor_id}   AND a.i_enabled = 1            
                    ORDER BY a.i_month  ; "; */   //sql เก่า
                            $sqlMain = "SELECT COUNT(a.bg_expense_id) as  bg_expense_count
                            ,COUNT(c.gl_sp_bg_hdr_id) as  gl_sp_bg_hdr_count
                            ,a.sp_gl_monthly_dtl_id
                            ,a.sp_gl_monthly_hdr_id
                            ,i_month
                            ,a.bg_expense_id
                            ,a.dc_expense_budget_type_id
                            ,a.dc_acc_id
                            ,a.gl_sp_dc_hdr_id
                            ,a.i_send_gl
                            ,a.dc_creditor_id
                            ,a.f_dr as f_month_total
                            --,a.c_comment
                            ,a.i_enabled
                            ,a.gl_sp_bg_hdr_id
                            ,a.po_expense_id
                            ,CONVERT(VARCHAR, a.d_date, 120) AS d_date
                            ,a.dc_user_create_id
                            ,a.dc_user_create_cost_id
                            ,a.d_create
                            ,a.dc_user_update_id
                            ,a.dc_user_update_cost_id
                            ,a.d_update
                                FROM  sp_gl_monthly_dtl a
                                    inner JOIN sp_gl_monthly_hdr b on a.sp_gl_monthly_hdr_id = b.sp_gl_monthly_hdr_id
                                    left join  NMU..gl_sp_bg_hdr c on a.bg_expense_id = c.bg_expense_id
                                    WHERE a.sp_gl_monthly_hdr_id = ?  and b.sp_tor_id =  {$sp_tor_id} AND a.i_enabled = 1            
                                    GROUP BY a.sp_gl_monthly_dtl_id 
                                    , a.bg_expense_id 
                                    ,a.sp_gl_monthly_hdr_id 
                                    ,i_month  ,a.dc_expense_budget_type_id
                                    ,a.dc_acc_id,a.gl_sp_dc_hdr_id,a.i_send_gl,a.dc_creditor_id
                                    ,a.f_dr
                                    ,a.bg_expense_id
                                    ,a.i_enabled
                                    ,a.gl_sp_bg_hdr_id
                                    ,a.po_expense_id
                                    ,a.d_date ,a.dc_user_create_id
                                    ,a.dc_user_create_cost_id
                                    ,a.d_create
                                    ,a.dc_user_update_id
                                    ,a.dc_user_update_cost_id 
                                    ,a.d_update ; ";
        $arrParam = array($_REQUEST["sp_gl_monthly_hdr_id"]);
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if ($stmt) {
            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "sp_gl_monthly_dtl_id" => $row["sp_gl_monthly_dtl_id"],
                    "sp_gl_monthly_hdr_id" => $row["sp_gl_monthly_hdr_id"],
                    "i_month" => $row["i_month"],
                    "bg_expense_count" => $row["bg_expense_count"],
                    "gl_sp_bg_hdr_count" => $row["gl_sp_bg_hdr_count"],
                    "gl_sp_bg_hdr_id" => $row["gl_sp_bg_hdr_id"],
                    "i_send_gl" => $row["i_send_gl"],
                    "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                    "dc_acc_id" => $row["dc_acc_id"],
                    "po_expense_id" => $row["po_expense_id"],
                    "gl_sp_dc_hdr_id" => $row["gl_sp_dc_hdr_id"],
                    "bg_expense_id" => $row["bg_expense_id"],
                    "dc_creditor_id" => $row["dc_creditor_id"],
                    "f_month_total" => $row["f_month_total"],
                    // "c_comment" => $row["c_comment"],
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
        $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"];
        $data["c_ref_doc"] = $_REQUEST["c_doc_ref"];
        $data["i_month_total"] = $_REQUEST["i_month_total"];
        $data['d_doc_date'] = $_REQUEST['d_date_monthly_hdr'];
        $data["dc_acc_id"] = $_REQUEST["dc_acc_idID"] ?? null;

        //      $data["po_expense_id"] = $_REQUEST["po_expense_id"];

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
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ",
                {$fldA} = ?";
            }
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

            $data["dc_acc_id"] = $fldd["dc_acc_id"] ?? null;
            $data["gl_sp_dc_hdr_id"] = $fldd["gl_sp_dc_hdr_id"] ?? null;
            // gl_sp_bg_hdr_id
            $data["gl_sp_bg_hdr_id"] = $fldd["gl_sp_bg_hdr_id"] ?? null;
            // $data["gl_sp_bg_hdr_id"] = $fldd["dc_acc_id"] ?? null;
            // $data["gl_sp_dc_hdr_id"] = $fldd["gl_sp_dc_hdr_id"] ?? null;
            $data["bg_expense_id"] = $fldd["po_expense_id"] ?? null;
            // gl_sp_dc_hdr_id 
            $data["dc_expense_budget_type_id"] = $fldd["dc_expense_budget_type_id"] ?? null;
            $data["dc_creditor_id"] = $fldd["dc_creditor_id"] ?? null;

            $data["po_expense_id"] = $fldd["po_expense_id"] ?? null;
            // $data["bg_expense_id"] = $fldd["po_expense_id"] ?? null;  gl_sp_bg_hdr_id

            $data["f_dr"] = $fldd["f_month_total"];
            $data["d_date"] = $fldd["d_date"];
            $data["c_comment"] = $fldd["c_comment"] ?? null;
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
                $upJson = "(select gl_sp_bg_dtl_id
                        ,gl_sp_bg_hdr_id
                        ,gl_sp_dc_dtl_id
                        ,i_rank
                        ,i_type_dr_cr
                        , CASE
                                WHEN i_type_dr_cr = 1 THEN 'เดบิต'
                                WHEN i_type_dr_cr = 2 THEN 'เครดิต'
                                ELSE '-'
                            END AS c_type_dr_cr
                        , dc_acc_id
                        , gl_sp_dc_hdr_id
                        ,(select c_code from NMU..dc_acc where dc_acc_id=NMU.dbo.gl_sp_bg_dtl.dc_acc_id) as c_code
                        ,(select c_name from NMU..dc_acc where dc_acc_id=NMU.dbo.gl_sp_bg_dtl.dc_acc_id) as c_name 
                    from NMU.dbo.gl_sp_bg_dtl
                    where gl_sp_bg_hdr_id = ?
                    order by i_rank FOR JSON AUTO)";
                
                $sql = "UPDATE NMU_ERP.dbo.sp_gl_monthly_dtl SET " . substr($addField, 1) . ", json_dr_cr = {$upJson} WHERE sp_gl_monthly_dtl_id = ?";
               
                $arrValue[] = $data["gl_sp_dc_hdr_id"];
                $arrValue[] = $fldd["sp_gl_monthly_dtl_id"]; //
//                echo $sql; 
//                print_r($arrValue);
//                exit();
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

        case "UP_SP_GL_MONTHLY_SIG":
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
            $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"];
            $data["c_ref_doc"] = $_REQUEST["c_doc_ref"];
            $data["i_month_total"] = $_REQUEST["i_month_total"];
            $data['d_doc_date'] = $_REQUEST['d_date_monthly_hdr'];
            $data["dc_acc_id"] = $_REQUEST["dc_acc_idID"] ?? null;
    
            //      $data["po_expense_id"] = $_REQUEST["po_expense_id"];
    
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
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ",
                    {$fldA} = ?";
                }
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
    
                $data["dc_acc_id"] = $fldd["dc_acc_id"] ?? null;
                $data["gl_sp_dc_hdr_id"] = $fldd["gl_sp_dc_hdr_id"] ?? null;
    
                $data["dc_acc_id"] = $fldd["dc_acc_id"] ?? null;
                $data["gl_sp_bg_hdr_id"] = $fldd["dc_acc_id"] ?? null;
                $data["gl_sp_dc_hdr_id"] = $fldd["gl_sp_dc_hdr_id"] ?? null;
                $data["bg_expense_id"] = $fldd["po_expense_id"] ?? null;
    
                $data["dc_expense_budget_type_id"] = $fldd["dc_expense_budget_type_id"] ?? null;
                $data["dc_creditor_id"] = $fldd["dc_creditor_id"] ?? null;
    
                $data["po_expense_id"] = $fldd["po_expense_id"] ?? null;
    
                $data["f_dr"] = $fldd["f_month_total"];
                $data["d_date"] = $fldd["d_date"];
                $data["c_comment"] = $fldd["c_comment"] ?? null;
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
    
            // $re    = array("success" => true, "id" => $_REQUEST["id"]);
    
    
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
