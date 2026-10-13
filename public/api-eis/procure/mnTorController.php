<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");  
require __DIR__.'/conf/config.php'; 
require __DIR__.'/lib/database/DatabaseServer.php';
require __DIR__.'/lib/database/apiUtil.php';
require __DIR__.'/lib/date/i_date.class.php';
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$method = $_SERVER['REQUEST_METHOD']; 
$json = file_get_contents("php://input");   
$datas = json_decode($json, true);  



$mode = $datas["mode"];
$table = "dbo.sp_tor";
$keyName = "tor_id";
$data = $util->mnUser($datas);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "PR";
$re_id = null;
$stmt2 = true;
$stmt3 = true;
/*
print_r($data);
exit();
 * * */
$row = $db->GetDataBySQL(" select  a.dc_user_create_id ,a.dc_user_create_cost_id,a.sp_emp_id,a.dc_cost_id
 ,(select top 1 dc_department_id from dbo.sp_tor where tor_id = a.sp_tor_id) as dc_department_id
 ,(select top 1 dc_cost2_id  from dbo.sp_tor where tor_id = a.sp_tor_id) as dc_cost2_id
 from dbo.sp_tor_contract a where a.sp_tor_contract_id = ? ", array($data["sp_tor_contract_id"]));  

$data["dc_user_update_id"] = $row["dc_user_create_id"];
$data["dc_user_update_cost_id"] = $row["dc_user_create_cost_id"]; 
$data["dc_department_id"] = $row["dc_department_id"];
$data["sp_emp_id"] = $row["dc_department_id"];
$data["user_id"] = $row["dc_user_create_id"];
$data["dc_cost_id"] = $row["dc_user_create_cost_id"];
$data["dc_cost2_id"] = $row["dc_cost2_id"];


$_REQUEST = $datas;
$_SESSION = $data;

$arrParam = array();
$addField = null;
$addValue = null;
$arrValue = array();
$arr_stmt    = array();


//End fn updateStaus
$db->BeginTran();
$d_tor_date = $data['d_tor_date'] ?? null;
$data['d_tor_date'] = !empty($d_tor_date) ? $date->bc_to_ad($data['d_tor_date']) : null;
$f_total_amt = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0; //str_replace(',', '', $data[$value]);
$data['dc_cost_id'] = $data['dc_cost_id'] ?? 38;
$data["c_comment"] = $data["c_comment"] ?? NULL;
switch ($mode) { 
    
   case "UP_SP_TOR_HDR_PERIOD":
    
        $root = "data";
            $data = array();
            $msg = "";
            // ============== //
            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
            // ============== //update dbo.sp_tor_hdr_period i_is_last = null where sp_tor_contract_id = {$data['sp_tor_contract_id']}
            $db->GetDataBySQL('update dbo.sp_tor_hdr_period set i_is_last = null where sp_tor_contract_id = ?', array($_REQUEST['sp_tor_contract_id']));
            $d_update = date("Y-m-d H:i:s");
            $data["sp_tor_contract_id"] = $_REQUEST['sp_tor_contract_id'];
            $data["dc_expense_budget_type_id"] = $_REQUEST['dc_expense_budget_type_id'] ?? null;
            $data["i_period"] = $_REQUEST['i_period'];
            $data["i_pr_type1"] = $_REQUEST['i_pr_type1'] ?? null;
            $data["i_is_last"] = $_REQUEST['i_is_last'] ?? null;
    
            $data['d_doc_date'] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
    
            $data["sp_po_id"] = $db->GetDataBySQL('SELECT sp_po_id FROM sp_po_hdr WHERE isnull(i_is_po,0) = 0 and sp_tor_contract_id = ?', array($_REQUEST['sp_tor_contract_id']));
            $data["i_day"] = $_REQUEST['i_day'];
            $data["i_alert"] = $_REQUEST['i_alert'];
    
            $data['d_period_date'] = !empty($_REQUEST['d_period_date']) ? $date->bc_to_ad($_REQUEST['d_period_date']) : null;
            $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amt"]);
            // $data["i_is_status"]		    = @$_REQUEST['i_seq_status'];
            $data["c_discription"] = $_REQUEST["c_discription"]??null;
            $data['dc_cost_id'] = $_REQUEST['dc_cost2_id']??null;
            // $data["i_is_po"] = @$_REQUEST["i_is_po"];
            $data['dc_user_create_id']  = $_SESSION["user_id"];
            $data['dc_user_create_cost_id']  = $_SESSION["dc_cost_id"];
            $data['dc_user_create_department_id']  = $_SESSION["dc_department_id"];
            $data['d_create']  = date("Y-m-d H:i:s");
            $data['dc_creditor_id']  = $_REQUEST["dc_creditor_id"]??null;
            $data['i_joint_venture'] = $_REQUEST["i_is_join_venture_per"] ?? null;
            $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_net_unit_price"]);
           

        if ($_REQUEST['sp_tor_hdr_period_id'] > 0) {
                
                if ($_REQUEST['copy_contract_dtl'] == 'save') {
                    foreach ($data as $fldA => $value) {
                        $arrValue[] = ($value != "") ? $value : null;
                        $addField .= ", {$fldA} = ?";
                    }
                    $sql = "UPDATE sp_tor_hdr_period SET " . substr($addField, 1) . " WHERE sp_tor_hdr_period_id = ?";
    
                    $arrValue[] = $_REQUEST["sp_tor_hdr_period_id"];
//                    echo $sql;
//                print_r($arrValue);
//                exit();  


                $stmt = $db->QueryParam($sql, $arrValue);
    
                    
                    $re_id = $data['sp_tor_hdr_period_id'];
                    $i_period = $data["i_period"]; 
                    $d_period_date = $data['d_period_date'];
                    $f_total_amt = $data["f_total_amt"];
                    
                    $arrValue2[] = $data['i_product_type'];
                    $arrValue2[] = $data['i_hire_type'];
                    $arrValue2[] = $f_total_amt;
                    $arrValue2[] = $re_id;
                    $sql2 = "UPDATE dbo.sp_tor_dtl_period SET  i_product_type =? , i_hire_type =? , f_net_unit_price =? WHERE sp_tor_hdr_period_id = ?";
                    
    
                $stmt2 = $db->QueryParam($sql2, $arrValue2);
                
                } else {
        //            $data["po_expense_id"] = $_REQUEST["sp_expense_id"];
//        $data["dc_unit_type_id"] = $_REQUEST["sp_unit_type_id"];
                //        print_r($_REQUEST);
//        exit();
                $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
                    $tor_id = $_REQUEST['tor_id'] ?? null;
                    $count = $_REQUEST['i_period'] ?? null;   //$db->GetDataBySQL("select (count(*)+1) as count from dbo.sp_tor_contract where sp_tor_contract_id=?", array($data['sp_tor_contract_id']));
                    $data['i_period'] = $count;
                    $row = $db->GetDataBySQL("select left(c_code,len(c_code)-5) as front,right(c_code,5) as back from dbo.sp_tor_contract where  i_enabled = 1  and sp_tor_id=?", array($tor_id));
                    $c_code = $row['front'] . '/' . $data['i_period'] . $row['back'];
                    $data['c_contract_code'] = $c_code;
                    foreach ($data as $fld => $value) {
                        $arrValue[] = ($value != "") ? $value : null;
                        $addField .= ", {$fld}";
                        $addValue .= ", ?";
                    }
    //                echo substr($addField, 1) . ") VALUES (" . substr($addValue, 1);
//                print_r($arrValue);
//                exit();
                $sql = "SET NOCOUNT ON 
                        INSERT INTO dbo.sp_tor_hdr_period (" . substr($addField, 1) . " , i_enabled ) VALUES (" . substr($addValue, 1) . ",1); 
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
                    // echo $sql .'/*'; print_r($arrValue); echo '*/'; exit;
                    $stmt = $db->QueryParam($sql, $arrValue);
                    $ss_id = $db->Fetch($stmt);
                    $re_id = $ss_id["id"];
                    $dc_creditor_name = $ss_id["dc_creditor_name"];
                    $c_doc_ref_contract = $ss_id["c_doc_ref_contract"];
                    $i_period = $data["i_period"];
                    $d_period_date = $data['d_period_date'];
                    $f_total_amt = $data['f_total_amt'];
                } //End coppies
            } else {


//                print_r($_REQUEST);
//            exit();

                $data["period_status_id"] = 4; //รอส่งมอบงาน
                    
            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
                $tor_id = $_REQUEST['tor_id'] ?? null;
                $row = $db->GetDataBySQL("select left(c_code,len(c_code)-5) as front,right(c_code,5) as back from dbo.sp_tor_contract where sp_tor_id=?", array($tor_id));
                $data['already_withdrawn'] = $_REQUEST['already_withdrawn']??null;               
                $data['i_pr_type1'] = $_REQUEST['i_pr_type1'];
                $c_code = $row['front'] . '/' . $data['i_period'] . $row['back'];
                $data['c_contract_code'] = $c_code;
                $data['i_is_erp'] = 1;
                $data['dc_cost_id'] = $_REQUEST['dc_cost2_id']??null;
                foreach ($data as $fld => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fld}";
                    $addValue .= ", ?";
                }
    //                echo substr($addField, 1) . ") VALUES (" . substr($addValue, 1);
//            print_r($arrValue);
//            exit();
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
//                 echo $sql . '/*';
//            print_r($arrValue);
//            echo '*/';
//            exit;
            $stmt = $db->QueryParam($sql, $arrValue);
                $ss_id = $db->Fetch($stmt);
                $re_id = $ss_id["id"];
                $dc_creditor_name = $ss_id["dc_creditor_name"];
                $c_doc_ref_contract = $ss_id["c_doc_ref_contract"];
                $i_period = $data["i_period"];
                $d_period_date = $data['d_period_date'];
                $dc_cost2_id = $data['dc_cost_id']??null;
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
                            $data["po_expense_id"] = $_REQUEST["sp_expense_id"];
                            $data["i_hire_type"] = $_REQUEST["i_hire_type_l"];
            if ($data["i_hire_type"] == 0) {
                                $data["i_product_type"] = null;
                                $data["i_is_inv"] = null;
                            } else {
                                // $data["i_product_type"] = $_REQUEST["i_product_typehdr"];
                                // $data["i_is_inv"] = $_REQUEST["i_is_inv"]; // เข้าคลัง หรือไม่เข้าคลัง
                            }
                            $data["i_product_type"] = $_REQUEST["i_product_type"] ?? null;

            //i_product_type am_mode_id inv_mode_id
                            $data["inv_mode_id"] = $_REQUEST["inv_mode_id"] ?? null;
                            $data["am_mode_id"] = $_REQUEST["am_mode_id"] ?? null;
                            $data["c_name"] = $_REQUEST["c_name"];
                            $data["i_qty"] = $_REQUEST["i_qty"];
                            $data["f_net_unit_price"] = str_replace(',', '', $_REQUEST["f_total_amt"]);
                            $data["f_net_total_price"] = $_REQUEST["f_total_amt"] * $_REQUEST["i_qty"];
                            $data["dc_unit_type_id"] = $_REQUEST["sp_unit_type_id"];
                            $data["dc_creditor_id"] = $db->GetDataBySQL('SELECT dc_creditor_id FROM sp_tor_contract WHERE  sp_tor_contract_id = ?', array($_REQUEST["sp_tor_contract_id"]));

                            $data["dc_user_update_id"] = $_SESSION["user_id"];
                            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
                            $data["d_update"] = date("Y-m-d H:i:s");

                            //        print_r($data);
                            //        exit();
                                $data["dc_user_create_id"] = $_SESSION["user_id"];
                                $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
                                $data["d_create"] = date("Y-m-d H:i:s");

                                foreach ($data as $fld => $value) {
                                    $arrValue[] = ($value != "") ? $value : null;
                                    $addField .= ", {$fld}";
                                    $addValue .= ", ?";
                                }

                                $sql = "
                                        SET NOCOUNT ON
                                        INSERT INTO sp_tor_dtl_period (" . substr($addField, 1) . ", i_enabled ) VALUES (" . substr($addValue, 1) . ",1);
                                        SELECT @@IDENTITY as id;";
                    //                                                    echo $sql;
//            print_r($arrValue);
//            exit();
            $stmt = $db->QueryParam($sql, $arrValue);
                                            // *****
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
                    "dtl_id" => $db->GetDataBySQL('select sp_tor_dtl_period_id from dbo.sp_tor_dtl_period where sp_tor_hdr_period_id = ?', array($re_id)),
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
   case "UP_SP_CHECK_PERIOD_DTL":
   
        $root = "data";
        $data = array();
        $mode = $_REQUEST["mode"] ?? null;
        $arrParam = array();
//set start
        $addField = null;
        $addValue = null;
        $arrValue = array();

        $Arr = $_REQUEST["data_dtl"];//json_decode($_REQUEST["data"], true);

        $data["sp_tor_hdr_period_id"] = $_REQUEST["sp_tor_hdr_period_id"];
        $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $data["sp_mn_contract_hdr_id"] = $_REQUEST["sp_mn_contract_hdr_id"] ?? null;
        
        $data["f_vat_amt"] = !empty($_REQUEST["f_vat_amt"]) ? str_replace(',', '', $_REQUEST["f_vat_amt"]) : 0;//$_REQUEST["f_vat_amt"] ?? null;
        $data["f_total_add_vat_amt"] =!empty($_REQUEST["f_total_add_vat_amt"]) ? str_replace(',', '', $_REQUEST["f_total_add_vat_amt"]) : 0;// $_REQUEST["f_total_add_vat_amt"] ?? null;
        $data["f_rate_vat"] = !empty($_REQUEST["f_rate_vat"]) ? str_replace(',', '', $_REQUEST["f_rate_vat"]) : 0;//$_REQUEST["f_rate_vat"] ?? null; //d.f_vat_amt ,d.f_total_add_vat_amt ,d.f_rate_vat 
        
        $data["i_is_po"] = $_REQUEST["i_is_po"] ?? null;
        $data["c_doc_ref"] = $_REQUEST["c_doc_ref"] ?? null;
        $data["d_arrive_date"] = $_REQUEST["d_arrive_date"];
        $data["d_doc_arrive_dt"] = $_REQUEST["d_doc_arrive_dt"];
        $data["c_comment"] = $_REQUEST["c_comment"] ?? null;
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");
        $data["dc_creditor_id"] =$_REQUEST["dc_creditor_per_id"];
        $data["i_enabled"] = 1 ;
        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ",
                {$fld}";
            $addValue .= ", ?";
        }
        // d_doc_arrive_dt
        $sql = "SET NOCOUNT ON
                INSERT INTO sp_check_period_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";

        $stmt = $db->QueryParam($sql, $arrValue);

        unset($addField);
        unset($addValue);
        unset($data);
        unset($arrValue);

        $ss_id = $db->Fetch($stmt);
        $sp_check_period_hdr_id = $ss_id["id"];

        foreach ($Arr as $fldd) {

//= !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0;
            $data["sp_check_period_hdr_id"] = $sp_check_period_hdr_id;
            $data["i_qty"] = $fldd["i_qty"];
            $data["sp_tor_hdr_period_id"] = $fldd["sp_tor_hdr_period_id"];
            $data["sp_tor_dtl_period_id"] = $fldd["sp_tor_dtl_period_id"];
            $data["dc_creditor_id"] = $fldd["dc_creditor_id"];
            $data["c_name"] = $fldd["c_name"];
            $data["dc_unit_type_id"] = $fldd["dc_unit_type_id"];
            $data["c_unit"] = $fldd["c_unit"];
            $data["dc_bg_budget_type_id"] = $fldd["dc_bg_budget_type_id"];
            $data["po_expense_id"] = $fldd["po_expense_id"];
            $data["i_hire_type"] = $fldd["i_hire_type"];
            $data["i_product_type"] = $fldd["i_product_type"];
            $data["i_is_inv"] = $fldd["i_is_inv"];
            $data["f_net_unit_price"] = !empty($fldd["f_net_unit_price"]) ? str_replace(',', '', $fldd["f_net_unit_price"]) : 0;
            $data["f_net_total_price"] = Floatval($data["f_net_unit_price"] * $data["i_qty"]);
            $data["dc_user_update_id"] = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");

// print_r($data);
//            exit;

            $addValue = null;
            $addField = null;
            $arrValue2 = null;

            foreach ($data as $fld => $value) {
                $arrValue2 [] = $value ?? null;
            }
// print_r($arrValue2);
//            exit;
//            $sql = "SET NOCOUNT ON
//                    INSERT INTO sp_check_period_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
//            echo print_r($arrValue2);
//            exit;
            $sqlDtl = "INSERT INTO sp_check_period_dtl ("
                    . "sp_check_period_hdr_id"
                    . ",i_qty"
                    . ",sp_tor_hdr_period_id"
                    . ",sp_tor_dtl_period_id"
                    . ",dc_creditor_id"
                    . ",c_name"
                    . ",dc_unit_type_id"
                    . ",c_unit,dc_bg_budget_type_id"
                    . ",po_expense_id"
                    . ",i_hire_type"
                    . ",i_product_type"
                    . ",i_is_inv"
                    . ",f_net_unit_price"
                    . ",f_net_total_price"
                    . ",dc_user_update_id"
                    . ",dc_user_update_cost_id"
                    . ",d_update,dc_user_create_id,dc_user_create_cost_id,d_create) "
                    . "VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
            $stmt2 = $db->QueryParam($sqlDtl, $arrValue2);
            unset($arrValue2); 
        } 
        break;
}
if (!in_array(false, $arr_stmt) && count($arr_stmt)) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => true, "msg" => "บันทีกเรียบร้อยแล้ว");
} else {
    if ($stmt && $stmt2 && $stmt3) {
        $db->CommitTran();
        $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $re_id);
    } else {
        $db->RollBackTran();
        $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
    }
}
echo json_encode($re);
exit;
