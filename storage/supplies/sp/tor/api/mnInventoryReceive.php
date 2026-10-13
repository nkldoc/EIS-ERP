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

$db->BeginTran();

switch ($mode) {
    case "tranf_items": 
        if ($data['sp_tranf_hdr_id']) { //update
            print_r($data);
            exit();
        } else { // insert
//             print_r($data);
//            exit();
            $dt1[] = $data['sp_tor_hdr_period_id'];
            $dt1[] = $data['sp_check_period_hdr_id'];
            $dt1[] = 1;
            $dt1[] = $data['dc_user_update_id'];
            $dt1[] = $data['dc_user_update_cost_id'];
            $dt1[] = $data['d_update'];
            $dt1[] = $data['dc_user_update_id'];
            $dt1[] = $data['dc_user_update_cost_id'];
            $dt1[] = $data['d_update'];

            $sql = " "
                    . " INSERT INTO dbo.sp_tranf_hdr (sp_tor_hdr_period_id ,sp_check_period_hdr_id,i_enabled"
                    . ", dc_user_create_id, dc_user_create_cost_id, d_create"
                    . ", dc_user_update_id, dc_user_update_cost_id, d_update)"
                    . " values (?,?,?,?,?,?,?,?,?);"
                    . " SELECT @@IDENTITY as hdr_id; "
                    . "";

            $stmt = $db->QueryParam($sql, $dt1);
            if ($stmt) {
                $next_result = $db->NextResult($stmt);
                if ($next_result) {
                    $ff = $db->Fetch($stmt);
                    $re_id = $ff["hdr_id"];
                    foreach ($data['f_period_amt'] as $k => $v) {
    
                        $rs[] = $re_id;
                        $rs[] = $data['sp_check_period_hdr_id'];
                        $rs[] = $data['sp_tor_dtl_period_id'];
                        $rs[] = $data['sp_check_period_dtl_id']; // 
                        $rs[] = $data['c_name_in'];

                        $rs[] = $data['i_workin_process'][$k] ?? 0;
                        $rs[] = $data['inv_mode_id'][$k] ?? 0;
                        $rs[] = $data['am_mode_id'][$k] ?? 0;
                        $rs[] = $data['i_is_inv'][$k] ?? 0; //i_is_inv
                        $rs[] = $data['pro_underprice'][$k] ?? 0; //i_is_inv
                        $rs[] = $data['qty'][$k] ?? 0;

                        $rs[] = str_replace(',', '', $data['f_period_amt'][$k]) ?? null;
                        $rs[] = str_replace(',', '', $data['f_period_amt'][$k]) ?? null;
                        $rs[] = str_replace(',', '', $data['f_period_amt'][$k]) ?? null;
    
                        $rs[] = $data['i_type_acc'][$k] ?? 0;
                        
                        $sql = " "
                                . " INSERT INTO dbo.sp_tranf_item (sp_tranf_hdr_id , sp_check_period_hdr_id, sp_tor_dtl_period_id, sp_check_period_dtl_id, c_name
                                    , i_workin_process
                                    , inv_mode_id
                                    , am_mode_id
                                    , i_is_inv
                                    , i_is_under
                                    , i_qty
                                    , f_wip_total_price
                                    , f_under_total_price
                                    , f_net_total_price
                                    , i_type_acc)"
                                . " values (?,?,?,?,?"
                                . ",?,?,?"
                                . ",?,?,?"
                                . ",?,?,?,?); ";
    
                        $stmt2 = $db->QueryParam($sql, $rs);
                        unset($rs);
                    }
                    $stmt3 = $db->QueryParam("UPDATE dbo.sp_check_period_hdr set sp_tranf_hdr_id=? where sp_check_period_hdr_id=?", array($re_id, $data['sp_check_period_hdr_id']));
                }
            }
        }

        break;
    case "ExtractPeriod":
        $f1 = $db->GetDataBySQL("select * from dbo.sp_tor_hdr_period where sp_tor_hdr_period_id=?", array($data['sp_tor_hdr_period_id']));
        $data['d_period_date'] = date('Y-m-d');
//        print_r($data);
//        exit(); 

        if (is_array($data['perioNew'])) {
            foreach ($data['perioNew'] as $k => $v) {
                $f_amt = str_replace(",", "", $data['f_period_amt'][$v]);
                $dt1[] = $f1['sp_tor_contract_id'];
                $dt1[] = $f1['sp_po_id'];
                $dt1[] = $f1['sp_mn_contract_hdr_id'];
                $dt1[] = $f1['c_contract_code'];
                $dt1[] = $f1['i_is_last'];
                $dt1[] = $f1['i_is_status'];
                $dt1[] = $data['perioNew'][$v]; //$f1['i_period']; 
                $dt1[] = $f1['i_alert'];
                $dt1[] = $f1['i_day'];
                $dt1[] = $f1['i_status'];
                $dt1[] = $f1['i_fine'];
                $dt1[] = $f1['f_fine_amt'];
                $dt1[] = $f1['d_doc_date'];
                $dt1[] = $f1['d_period_date'];
                $dt1[] = $f_amt;
                $dt1[] = $f1['i_is_null'];
                $dt1[] = $f1['c_discription'];
                $dt1[] = $f1['sp_emp_id'];
                $dt1[] = $f1['d_emp_dt'];
                $dt1[] = $f1['dc_expense_budget_type_id'];
                $dt1[] = $f1['bg_reserve_money_id'];
                $dt1[] = $f1['i_pr_type1'];
                $dt1[] = $f1['dc_user_update_id'];
                $dt1[] = $f1['dc_user_update_cost_id'];
                $dt1[] = $f1['d_update'];
                $dt1[] = $f1['period_status_id'];
                $dt1[] = $f1['dc_cost_id'];
                $dt1[] = $f1['i_enabled'];
                $dt1[] = $f1['dc_user_create_id'];
                $dt1[] = $f1['dc_user_create_cost_id'];
                $dt1[] = $f1['dc_user_create_department_id'];
                $dt1[] = $f1['d_create'];
                $dt1[] = $f1['dc_cost2_id'];
                $dt1[] = $f1['dc_creditor_id'];
                $dt1[] = $f1['i_joint_venture'];  //35


                $sql = "
                declare @id as bigint;     
                select * INTO #TempDestinationTable1 from sp_tor_dtl_period  where sp_tor_hdr_period_id = {$data['sp_tor_hdr_period_id']}     
                INSERT INTO dbo.sp_tor_hdr_period (sp_tor_contract_id
                                    ,sp_po_id
                                    ,sp_mn_contract_hdr_id
                                    ,c_contract_code
                                    ,i_is_last
                                    ,i_is_status
                                    ,i_period
                                    ,i_alert
                                    ,i_day
                                    ,i_status
                                    ,i_fine
                                    ,f_fine_amt
                                    ,d_doc_date
                                    ,d_period_date
                                    ,f_total_amt
                                    ,i_is_null
                                    ,c_discription
                                    ,sp_emp_id
                                    ,d_emp_dt
                                    ,dc_expense_budget_type_id
                                    ,bg_reserve_money_id
                                    ,i_pr_type1
                                    ,dc_user_update_id
                                    ,dc_user_update_cost_id
                                    ,d_update
                                    ,period_status_id
                                    ,dc_cost_id
                                    ,i_enabled
                                    ,dc_user_create_id
                                    ,dc_user_create_cost_id
                                    ,dc_user_create_department_id
                                    ,d_create
                                    ,dc_cost2_id
                                    ,dc_creditor_id
                                    ,i_joint_venture) VALUES (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?);"
                        . " select @id =  @@IDENTITY; ";

                $sql .= " update #TempDestinationTable1 set sp_tor_hdr_period_id = @id, f_net_unit_price = $f_amt, f_net_total_price = $f_amt; ";
                $sql .= " INSERT INTO sp_tor_dtl_period ( sp_tor_hdr_period_id
                    ,sp_tor_dtl_id
                    ,sp_tor_id
                    ,dc_creditor_id
                    ,c_name
                    ,i_qty
                    ,dc_unit_type_id
                    ,c_unit
                    ,dc_bg_budget_type_id
                    ,po_expense_id
                    ,i_hire_type
                    ,i_product_type
                    ,i_is_inv
                    ,f_net_unit_price
                    ,f_net_total_price
                    ,dc_user_create_id
                    ,dc_user_create_cost_id
                    ,dc_user_create_department_id
                    ,d_create
                    ,dc_user_update_id
                    ,dc_user_update_cost_id
                    ,dc_user_update_department_id
                    ,d_update
                    ,inv_mode_id
                    ,am_mode_id
                    ,i_enabled)
            SELECT sp_tor_hdr_period_id
                    ,sp_tor_dtl_id
                    ,sp_tor_id
                    ,dc_creditor_id
                    ,c_name
                    ,i_qty
                    ,dc_unit_type_id
                    ,c_unit
                    ,dc_bg_budget_type_id
                    ,po_expense_id
                    ,i_hire_type
                    ,i_product_type
                    ,i_is_inv
                    ,f_net_unit_price
                    ,f_net_total_price
                    ,dc_user_create_id
                    ,dc_user_create_cost_id
                    ,dc_user_create_department_id
                    ,d_create
                    ,dc_user_update_id
                    ,dc_user_update_cost_id
                    ,dc_user_update_department_id
                    ,d_update
                    ,inv_mode_id
                    ,am_mode_id
                    ,i_enabled FROM #TempDestinationTable1;
                  /*  INSERT INTO dbo.sp_tor_item (tor_id
                            , contract_id
                            , sp_tor_hdr_period_id
                            , d_period_status_date
                            , act_user_id
                            , act_cost_id
                            , act_date_dt
                        ) VALUES (
                            (SELECT sp_tor_id FROM dbo.sp_tor_contract WHERE sp_tor_contract_id = {$data["sp_tor_contract_id"]})
                            , {$data['sp_tor_contract_id']}
                            , @id
                            , {$data['d_period_date']}
                            , {$data["dc_user_update_id"]}
                            , {$data["dc_user_update_cost_id"]}
                            , {$data["d_update"]}
                        ); */
                    drop table TempDestinationTable1";

                $stmt = $db->QueryParam($sql, $dt1);
            }
        }

//f_net_unit_price = $f_amt, f_net_total_price =

        $stmt2 = $db->QueryParam(""
                . " update dbo.sp_tor_hdr_period set f_total_amt=? , dc_user_update_id = ? , dc_user_update_cost_id = ? , d_update = ? where sp_tor_hdr_period_id=?;"
                . " update dbo.sp_tor_dtl_period set f_net_unit_price=? ,f_net_total_price=? , dc_user_update_id = ? , dc_user_update_cost_id = ? , d_update = ? where sp_tor_hdr_period_id=?;"
                , array(str_replace(",", "", $data['f_total_amt_after'])
            , $data["dc_user_update_id"]
            , $data["dc_user_update_cost_id"]
            , $data["d_update"]
            , $data['sp_tor_hdr_period_id']
            , str_replace(",", "", $data['f_total_amt_after'])
            , str_replace(",", "", $data['f_total_amt_after'])
            , $data["dc_user_update_id"]
            , $data["dc_user_update_cost_id"]
            , $data["d_update"]
            , $data['sp_tor_hdr_period_id']));

        $re_id = $data['sp_tor_hdr_period_id'];

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
