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
$stmt = true;
$stmt2 = true;
$stmt3 = true;

$arrParam = array();
$addField = null;
$addValue = null;
$arrValue = array();
    
//End fn updateStaus
$db->BeginTran();
    
switch ($mode) { 
    
    case "ADDROW":
        $str = "";
        $sp_gl_monthly_hdr_id = $data['sp_gl_monthly_hdr_id'];
        $f_total_all_month = floatval(str_replace(",", "",$data['f_total_all_month']));
        $i_month_total = $data['i_month_total'];
        $f_total_all_month2  = ($f_total_all_month / $data['i_month_total']);
        $dc_expense_budget_in_tor = $data['dc_expense_budget_in_tor'];
        $po_expense_id = $data['po_expense_id'];
        $gl_sp_bg_hdr_id = $data['gl_sp_bg_hdr_id'];
        $dc_user_create_id = $_SESSION["user_id"];
        $dc_cost_id = $_SESSION["dc_cost_id"];
        $d_create = $_SESSION["last_login"];
        $sp_tor_id = $data['sp_tor_id'];
        $sp_tor_contract_id = $data['sp_tor_contract_id'];
        $d_date_monthly_hdr = $data['d_date_monthly_hdr'];
        $d_date_monthly_hdr1 = !empty($d_date_monthly_hdr) ? $date->bc_to_ad($d_date_monthly_hdr) : null;
        $id = 0 ;

        //  =    $d_date_monthly_hdr - 543  ;
        // echo $d_create ;
        // print_r($_SESSION);
        // exit();

        if($sp_gl_monthly_hdr_id == 0  ){

            $sql1 = "
            SET NOCOUNT ON
            INSERT INTO sp_gl_monthly_hdr 
            (sp_tor_id 
            , sp_tor_contract_id 
            , f_total 
            , i_month_total 
            , d_doc_date
            , dc_cost_id 
            , i_enabled 
            , dc_user_create_id 
            , dc_user_create_cost_id 
            , d_create 
            , dc_user_update_id
            , dc_user_update_cost_id
            , d_update
            ) 
            VALUES ('{$sp_tor_id}'
            , '{$sp_tor_contract_id}'
            , '{$f_total_all_month}'
            , '{$i_month_total}'
            , '{$d_date_monthly_hdr1}'
            , '{$dc_cost_id}'
            , '1'
            , '{$dc_user_create_id}'
            , '{$dc_cost_id}'
            , '{$d_create}'
            , '{$dc_user_create_id}'
            , '{$dc_cost_id}'
            , '{$d_create}'
                ) ;
            SELECT @@IDENTITY as id;"; 
            // echo ($sql1);
    $para1 = $db->QueryParam($sql1, $arrValue);
    $ss_id1 = $db->Fetch($para1);
    $id = $ss_id1["id"];
        } else {

            $sql1 = "
            update sp_gl_monthly_hdr 
            set i_month_total =  {$i_month_total}
            , d_doc_date = '{$d_date_monthly_hdr1}'
            , dc_user_update_id = '{$dc_user_create_id}'
            , dc_user_update_cost_id = '{$dc_cost_id}' 
            , d_update = getDate()
            where  sp_gl_monthly_hdr_id = {$sp_gl_monthly_hdr_id} ; 


            delete from  sp_gl_monthly_dtl where sp_gl_monthly_hdr_id =  {$sp_gl_monthly_hdr_id};";
            
    $para1 = $db->QueryParam($sql1, $arrValue);
    $ss_id1 = $db->Fetch($para1);
        }
        if ($id > 0 ) { 
            $sp_gl_monthly_hdr_id = $id;
        } else {
        }
        // echo $sp_gl_monthly_hdr_id ;
        // echo $id ; 
        // exit; 
        for ($x = 0; $x < $data["i_month_total"]; $x++) {
            // $x2 = $f_total_all_month / ($x + 1);
            // echo "The number is: $x <br>";
            $add_mont =  date('Y-m-d', strtotime("+{$x} months", strtotime($d_date_monthly_hdr1)));
            $add_lase_mont =  date("Y-m-t", strtotime($add_mont));
            $x2 = $x +1;
            $str .="({$x2} ,  '".$add_lase_mont . "' ,{$f_total_all_month2} 
                    , {$sp_gl_monthly_hdr_id}
                    , {$dc_expense_budget_in_tor} 
                    , {$po_expense_id} 
                    , {$po_expense_id} 
                    , {$gl_sp_bg_hdr_id}
                    , 1 
                    , {$dc_user_create_id}
                    , {$dc_cost_id}
                    , '{$d_create}'
                    , {$dc_user_create_id}
                    , {$dc_cost_id}
                    , '{$d_create}'
                    ),"; 
            // $addField .= ",
        }
            // echo ($str);
            // exit();
    $add_value =  substr($str, 0, -1); 
    // print_r($data);exit();
                $sql = "INSERT INTO sp_gl_monthly_dtl (i_month
                                                        ,d_date
                                                        ,f_dr
                                                        ,sp_gl_monthly_hdr_id
                                                        ,dc_expense_budget_type_id 
                                                        ,po_expense_id
                                                        ,bg_expense_id
                                                        ,gl_sp_bg_hdr_id 
                                                        ,i_enabled
                                                        ,dc_user_create_id
                                                        ,dc_user_create_cost_id
                                                        ,d_create 
                                                        ,dc_user_update_id
                                                        ,dc_user_update_cost_id
                                                        ,d_update
                                                        )
                                VALUES
                                    {$add_value} ;    ";

                        // echo ($sql);
                        // exit ();
                $para = $db->QueryParam($sql, $arrValue);
                $ss_id = $db->Fetch($para);
                //$id = $ss_id["id"];
        break;
    
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
