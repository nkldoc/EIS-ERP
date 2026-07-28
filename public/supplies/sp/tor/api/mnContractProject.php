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
$re_id2 = null;
$stmt2 = true;
$stmt3 = true;
$ret_id = null;
$ret_id2= null;
$db->BeginTran();
switch ($mode) {
    case "REQUEST_EXT_CONTRACT": 
        $data['sp_tor_id'] = $db->GetDataBySQL("SELECT sp_tor_id FROM dbo.sp_tor_contract where sp_tor_contract_id=?", array($data["sp_tor_contract_id"]));
        $sp_tor_id = $data['sp_tor_id'];
//        print_r($data); exit();
        $re_id      = $sp_tor_id;     
        $arrParam[] = 1;  
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $re_id;
        

        $sql = "UPDATE dbo.sp_tor SET  i_is_request =?"
                . " , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                "
                . " WHERE tor_id = ?"; 
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "NEW_EXT_CONTRACT":
      $data['sp_tor_id'] = $db->GetDataBySQL("SELECT sp_tor_id FROM dbo.sp_tor_contract where sp_tor_contract_id=?", array($data["sp_tor_contract_id"]));
      $sp_tor_id = $data['sp_tor_id'];
    $fld1 ="
    DECLARE @new_tor_id AS bigint; 
    INSERT INTO sp_tor (/*[tor_id]
      ,*/[tor_type_id]
      ,[c_code]
      ,[c_name]
      ,[bg_budget_dtl_project_id]
      ,[c_budget_dtl_project]
      ,[dc_cnt_id]
      ,[sp_emp_id]
      ,[sp_emp_id2]
      ,[sp_emp_id3]
      ,[po_creditor_id]
      ,[i_purchase]
      ,[i_product_type]
      ,[i_type_contract]
      ,[i_hire_type]
      ,[i_is_notor]
      ,[i_is_inv]
      ,[i_type_fix_rate]
      ,[i_delivery_date]
      ,[dc_cost_id]
      ,[txtsub_cost]
      ,[index_receive]
      ,[dc_department_id]
      ,[i_receive]
      ,[d_tor_date]
      ,[d_tor_status_date]
      ,[d_tor_date_alert]
      ,[d_tor_date_pa]
      ,[i_alarm_balance]
      ,[i_step]
      ,[tor_status_id]
      ,[tor_status_back_id]
      ,[i_forword]
      ,[i_backword]
      ,[i_is_more]
      ,[i_parent]
      ,[i_is_rename]
      ,[i_is_parent]
      ,[i_yyyy]
      ,[c_department]
      ,[d_doc_ref]
      ,[f_period_amt]
      ,[f_total_amt]
      ,[dc_expense_budget_type_id]
      ,[f_type_amt]
      ,[i_pr_type1]
      ,[bg_reserve_money1_id]
      ,[dc_expense_budget_type2_id]
      ,[f_type2_amt]
      ,[i_pr_type2]
      ,[bg_reserve_money2_id]
      ,[dc_expense_budget_type3_id]
      ,[f_type3_amt]
      ,[i_pr_type3]
      ,[bg_reserve_money3_id]
      ,[dc_expense_budget_type4_id]
      ,[f_type4_amt]
      ,[i_pr_type4]
      ,[bg_reserve_money4_id]
      ,[dc_expense_budget_type5_id]
      ,[f_type5_amt]
      ,[i_pr_type5]
      ,[bg_reserve_money5_id]
      ,[po_expense_id]
      ,[start_date]
      ,[end_date]
      ,[c_comment]
      ,[c_remake]
      ,[i_is_pause]
      ,[tag]
      ,[i_is_complete]
      ,[i_is_register]
      ,[i_enabled]
      ,[i_problem]
      ,[c_problem]
      ,[dc_user_create_id]
      ,[dc_user_create_cost_id]
      ,[dc_user_create_department_id]
      ,[d_create]
      ,[dc_user_update_id]
      ,[dc_user_update_cost_id]
      ,[dc_user_update_department_id]
      ,[d_update]
      ,[f_peroid_amt]
      ,[i_edit]
      ,[dc_cost2_id]
      ,[c_pdf]
      ,[d_doc_date]
      ,[upload]
      ,[i_is_upload]
      ,[i_menu_edit]
      ,[i_type_bg]
      ,[sp_type_id]
      ,[i_is_request])
    SELECT /*[tor_id]
      ,*/[tor_type_id]
      ,[c_code]
      ,[c_name]
      ,[bg_budget_dtl_project_id]
      ,[c_budget_dtl_project]
      ,[dc_cnt_id]
      ,[sp_emp_id]
      ,[sp_emp_id2]
      ,[sp_emp_id3]
      ,[po_creditor_id]
      ,[i_purchase]
      ,[i_product_type]
      ,[i_type_contract]
      ,[i_hire_type]
      ,[i_is_notor]
      ,[i_is_inv]
      ,[i_type_fix_rate]
      ,[i_delivery_date]
      ,[dc_cost_id]
      ,[txtsub_cost]
      ,[index_receive]
      ,[dc_department_id]
      ,[i_receive]
      ,[d_tor_date]
      ,[d_tor_status_date]
      ,[d_tor_date_alert]
      ,[d_tor_date_pa]
      ,[i_alarm_balance]
      ,[i_step]
      ,[tor_status_id]
      ,[tor_status_back_id]
      ,[i_forword]
      ,[i_backword]
      ,[i_is_more]
      ,[i_parent]
      ,[i_is_rename]
      ,[i_is_parent]
      ,[i_yyyy]
      ,[c_department]
      ,[d_doc_ref]
      ,[f_period_amt]
      ,[f_total_amt]
      ,null as [dc_expense_budget_type_id]
      ,null as [f_type_amt]
      ,null as [i_pr_type1]
      ,null as [bg_reserve_money1_id]
      ,null as [dc_expense_budget_type2_id]
      ,null as [f_type2_amt]
      ,null as [i_pr_type2]
      ,null as [bg_reserve_money2_id]
      ,null as [dc_expense_budget_type3_id]
      ,null as [f_type3_amt]
      ,null as [i_pr_type3]
      ,null as [bg_reserve_money3_id]
      ,[dc_expense_budget_type4_id]
      ,[f_type4_amt]
      ,[i_pr_type4]
      ,[bg_reserve_money4_id]
      ,[dc_expense_budget_type5_id]
      ,[f_type5_amt]
      ,[i_pr_type5]
      ,[bg_reserve_money5_id]
      ,[po_expense_id]
      ,[start_date]
      ,[end_date]
      ,[c_comment]
      ,[c_remake]
      ,[i_is_pause]
      ,[tag]
      ,[i_is_complete]
      ,[i_is_register]
      ,[i_enabled]
      ,[i_problem]
      ,[c_problem]
      ,[dc_user_create_id]
      ,[dc_user_create_cost_id]
      ,[dc_user_create_department_id]
      ,[d_create]
      ,[dc_user_update_id]
      ,[dc_user_update_cost_id]
      ,[dc_user_update_department_id]
      ,[d_update]
      ,[f_peroid_amt]
      ,[i_edit]
      ,[dc_cost2_id]
      ,[c_pdf]
      ,[d_doc_date]
      ,[upload]
      ,[i_is_upload]
      ,[i_menu_edit]
      , 8 as [i_type_bg]
      ,[sp_type_id]
      ,[i_is_request] FROM sp_tor where tor_id = ?; 
 
    select @new_tor_id = @@IDENTITY;
    
    INSERT INTO sp_tor_dtl (/*[sp_tor_dtl_id]
      ,*/[sp_tor_id]
      ,[c_name]
      ,[i_qty]
      ,[i_used]
      ,[i_balance]
      ,[dc_unit_type_id]
      ,[c_unit]
      ,[bg_reserve_money_id]
      ,[i_pr_type1]
      ,[dc_bg_budget_type_id]
      ,[i_product_type]
      ,[i_is_inv]
      ,[po_expense_id]
      ,[dc_creditor_id]
      ,[i_hire_type]
      ,[f_disc_price]
      ,[f_unit_price]
      ,[f_total_price]
      ,[f_net_disc_price]
      ,[f_net_unit_price]
      ,[f_net_total_price]
      ,[dc_user_create_id]
      ,[dc_user_create_cost_id]
      ,[dc_user_create_department_id]
      ,[d_create]
      ,[dc_user_update_id]
      ,[dc_user_update_cost_id]
      ,[dc_user_update_department_id]
      ,[d_update]
      ,[f_peroid_amt]
      ,[inv_mode_id]
      ,[am_mode_id]
      ,[sp_bg_mode_id])
    SELECT	/*[sp_tor_dtl_id]
      ,*/@new_tor_id as [sp_tor_id]
      ,[c_name]
      ,[i_qty]
      ,[i_used]
      ,[i_balance]
      ,[dc_unit_type_id]
      ,[c_unit]
      ,null as [bg_reserve_money_id]
      ,null as [i_pr_type1]
      ,null as [dc_bg_budget_type_id]
      ,[i_product_type]
      ,[i_is_inv]
      ,[po_expense_id]
      ,[dc_creditor_id]
      ,[i_hire_type]
      ,[f_disc_price]
      ,[f_unit_price]
      ,[f_total_price]
      ,[f_net_disc_price]
      ,[f_net_unit_price]
      ,[f_net_total_price]
      ,[dc_user_create_id]
      ,[dc_user_create_cost_id]
      ,[dc_user_create_department_id]
      ,[d_create]
      ,[dc_user_update_id]
      ,[dc_user_update_cost_id]
      ,[dc_user_update_department_id]
      ,[d_update]
      ,[f_peroid_amt]
      ,[inv_mode_id]
      ,[am_mode_id]
      ,[sp_bg_mode_id] FROM sp_tor_dtl where sp_tor_id =?;
      
    INSERT INTO sp_tor_contract (/*[sp_tor_contract_id]
      ,*/[parent_id]
      ,[sp_tor_id]
      ,[dc_creditor_id]
      ,[c_code]
      ,[c_name]
      ,[c_doc_ref]
      ,[c_po_no]
      ,[d_doc_date]
      ,[d_po_date]
      ,[d_due_date]
      ,[i_notor]
      ,[i_notification]
      ,[f_total_amt]
      ,[i_is_complete]
      ,[i_status]
      ,[c_discription]
      ,[i_contract_status]
      ,[i_parent]
      ,[i_is_monthly]
      ,[i_is_po]
      ,[i_is_signin]
      ,[i_is_edit]
      ,[d_signin_date]
      ,[i_is_warranty]
      ,[i_is_close]
      ,[close_detail]
      ,[i_is_return]
      ,[d_return_warranty]
      ,[c_return_warranty]
      ,[c_return_comment]
      ,[i_delivery]
      ,[i_is_warranty_book]
      ,[i_type_fine]
      ,[book_no]
      ,[book_seq]
      ,[d_book_date]
      ,[i_is_percen]
      ,[f_percen]
      ,[f_warranty_amt]
      ,[c_remark]
      ,[book_warranty_no]
      ,[d_book_warranty_date]
      ,[dc_bank_id]
      ,[f_fine]
      ,[f_book_warranty_amt]
      ,[d_book_warranty_end]
      ,[c_remark1]
      ,[i_enabled]
      ,[dc_cost_id]
      ,[sp_emp_id]
      ,[d_emp_dt]
      ,[dc_user_create_id]
      ,[dc_user_create_cost_id]
      ,[dc_user_create_department_id]
      ,[d_create]
      ,[dc_user_update_id]
      ,[dc_user_update_cost_id]
      ,[dc_user_update_department_id]
      ,[d_update]
      ,[dc_user_update_cost_id1]
      ,[dc_user_update_department_id1]
      ,[d_update1]
      ,[i_step]
      ,[i_is_period]
      ,[d_cashiercheque_data]
      ,[cashiercheque_on]
      ,[cashiercheque_seq]
      ,[f_warranty_cashiercheque]
      ,[c_remark_cashiercheque]
      ,[dc_expense_budget_type_id]
      ,[f_type_amt]
      ,[i_pr_type1]
      ,[bg_reserve_money1_id]
      ,[dc_expense_budget_type2_id]
      ,[f_type2_amt]
      ,[i_pr_type2]
      ,[bg_reserve_money2_id]
      ,[bg_reserve_i_last1]
      ,[bg_reserve_i_last2]
      ,[i_booking_bg]
      ,[i_yyyy_overlap]
      ,[c_overlap]
      ,[i_overlap]
      ,[bg_reserve_overlap_id]
      ,[sp_type_id]) 
    SELECT /*[sp_tor_contract_id]
      ,*/? as [parent_id]
      ,@new_tor_id as [sp_tor_id]
      ,[dc_creditor_id]
      ,[c_code]
      ,[c_name]
      ,[c_doc_ref]
      ,[c_po_no]
      ,[d_doc_date]
      ,[d_po_date]
      ,[d_due_date]
      ,[i_notor]
      ,[i_notification]
      ,[f_total_amt]
      ,[i_is_complete]
      ,[i_status]
      ,[c_discription]
      ,[i_contract_status]
      ,[i_parent]
      ,[i_is_monthly]
      ,[i_is_po]
      ,[i_is_signin]
      ,[i_is_edit]
      ,[d_signin_date]
      ,[i_is_warranty]
      ,[i_is_close]
      ,[close_detail]
      ,[i_is_return]
      ,[d_return_warranty]
      ,[c_return_warranty]
      ,[c_return_comment]
      ,[i_delivery]
      ,[i_is_warranty_book]
      ,[i_type_fine]
      ,[book_no]
      ,[book_seq]
      ,[d_book_date]
      ,[i_is_percen]
      ,[f_percen]
      ,[f_warranty_amt]
      ,[c_remark]
      ,[book_warranty_no]
      ,[d_book_warranty_date]
      ,[dc_bank_id]
      ,[f_fine]
      ,[f_book_warranty_amt]
      ,[d_book_warranty_end]
      ,[c_remark1]
      ,[i_enabled]
      ,[dc_cost_id]
      ,[sp_emp_id]
      ,[d_emp_dt]
      ,[dc_user_create_id]
      ,[dc_user_create_cost_id]
      ,[dc_user_create_department_id]
      ,[d_create]
      ,[dc_user_update_id]
      ,[dc_user_update_cost_id]
      ,[dc_user_update_department_id]
      ,[d_update]
      ,[dc_user_update_cost_id1]
      ,[dc_user_update_department_id1]
      ,[d_update1]
      ,[i_step]
      ,[i_is_period]
      ,[d_cashiercheque_data]
      ,[cashiercheque_on]
      ,[cashiercheque_seq]
      ,[f_warranty_cashiercheque]
      ,[c_remark_cashiercheque]
      ,[dc_expense_budget_type_id]
      ,null as [f_type_amt]
      ,null as [i_pr_type1]
      ,null as [bg_reserve_money1_id]
      ,null as [dc_expense_budget_type2_id]
      ,null as [f_type2_amt]
      ,null as [i_pr_type2]
      ,null as [bg_reserve_money2_id]
      ,null as [bg_reserve_i_last1]
      ,null as [bg_reserve_i_last2]
      ,null as [i_booking_bg]
      ,null as [i_yyyy_overlap]
      ,null as [c_overlap]
      ,null as [i_overlap]
      ,null as [bg_reserve_overlap_id]
      ,[sp_type_id] FROM sp_tor_contract where sp_tor_contract_id = ?";
         
    
        if($data['sp_tor_id']){
            // copy tor_id as null
            $stmt = $db->QueryParam($fld1, array($data['sp_tor_id'], $data['sp_tor_id'], $data['sp_tor_contract_id'] , $data['sp_tor_contract_id']));
    
            
        }
    
        break;
    
    case "UP_SP_TOR_HDR_PERIOD":
         print_r($data); exit();
         
        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
     
        $data["sp_tor_contract_id"] = $_REQUEST['sp_tor_contract_id'];
        $data["dc_expense_budget_type_id"] = $_REQUEST['dc_expense_budget_type_id'] ?? null;
        $data["i_period"] = $_REQUEST['i_period'];
        $data["i_pr_type1"] = $_REQUEST['i_pr_type1'] ?? null;
        $data["i_is_last"] = $_REQUEST['i_is_last'] ?? null; 
        $data['d_doc_date'] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null; 
        $data["i_day"] = $_REQUEST['i_day'];
        $data["i_alert"] = $_REQUEST['i_alert']; 
        $data['d_period_date'] = !empty($_REQUEST['d_period_date']) ? $date->bc_to_ad($_REQUEST['d_period_date']) : null;
        $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amt"]); 
        $data["c_discription"] = $_REQUEST["c_discription"];

        print_r($data); exit();
        break;
    
    case "DEL": 
      $root = "data";
      $data = array();
      $msg = "";
      // ============== //
      $addField = null;
      $addValue = null;
      unset($data);
      unset($arrValue);
        $data["sp_tor_id"] = $_REQUEST['sp_tor_pro_id'];
        $data["sp_tor_contract_id"] = $_REQUEST['sp_tor_contract_pro_id'];

        $sql = "  UPDATE  dbo.sp_tor  SET i_enabled = 2  where tor_id = ?   ; 
                  UPDATE  dbo.sp_tor_contract  SET i_enabled = 2  where sp_tor_contract_id = ?   ; 
        ";
        $stmt = $db->QueryParam($sql, array($data["sp_tor_id"], $data["sp_tor_contract_id"])); 
        
        break;
    
    case "EDIT":
      $root = "data";
      $data = array();
      $msg = "";
      // ============== //
      $addField = null;
      $addValue = null;
      unset($data);
      unset($arrValue);
        // ตัวรอง        
        $data["sp_tor_contract_id"]             =              $_REQUEST['sp_tor_contract_pro_id'];
        $sp_tor_pro_id                          =              $_REQUEST['sp_tor_pro_id'];
        $i_yyyy_overlap                         =              $_REQUEST['i_yyyy_overlap']; // ปีที่ใช้งบประมาณ
        $i_yyyy                                 =              $_REQUEST['i_yyyy']; // ปีที่ใช้งบประมาณ
        $po_expense_id                          =              $_REQUEST['po_expense_id'];
        $dc_expense_budget_type_id              =              $_REQUEST['dc_expense_budget_type_id'];
        $d_doc_date                             =              !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null; 
        $d_due_date                             =              !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null; 
        $f_total_amt                            =              str_replace(",", "", $_REQUEST["f_total_amt"]);
        $i_pr_type1                             =              $_REQUEST['i_pr_type1'];
        $i_booking_bg                           =              $_REQUEST['i_booking_bg'];  
        $po_expense_id                          =              $_REQUEST['po_expense_id'];
        $d_update = date("Y-m-d H:i:s");
        $dc_user_update_id                      =              $_SESSION['user_id'];
        $dc_user_update_cost_id                 =              $_SESSION['dc_cost_id'];
//   ตัวหลัก
          $sp_tor_id                              =              $_REQUEST['sp_tor_id'];
  
        $sql = " SET NOCOUNT ON  
                update sp_tor 
                  set     
                          i_yyyy =  {$i_yyyy} 
                          ,po_expense_id = {$po_expense_id}
                          ,dc_expense_budget_type_id = {$dc_expense_budget_type_id}
                          , f_total_amt  = '{$f_total_amt}'
                          , i_pr_type1 = {$i_pr_type1}
                          , d_update =  '{$d_update}' 
                          , dc_user_update_id = {$dc_user_update_id}
                          , dc_user_update_cost_id = {$dc_user_update_cost_id}
                          where tor_id  =   {$sp_tor_pro_id}  ;
                  SET NOCOUNT ON 
                  update sp_tor_contract 
                  set     
                          i_yyyy_overlap =   {$i_yyyy_overlap}   
                          , i_booking_bg = {$i_booking_bg}
                          , dc_expense_budget_type_id = {$dc_expense_budget_type_id}
                          , d_doc_date =  '{$d_doc_date}'
                          , d_due_date =  '{$d_due_date}'
                          , f_total_amt  = '{$f_total_amt}'
                          , i_pr_type1 = {$i_pr_type1}
                          , d_update =  '{$d_update}'
                          , dc_user_update_id = {$dc_user_update_id}
                          , dc_user_update_cost_id = {$dc_user_update_cost_id}
                          where sp_tor_contract_id = ? ;  
                          ";  
                          
                          $stmt = $db->QueryParam($sql, array($data["sp_tor_contract_id"])); 
        break;
        case "ADD": 
          $data['d_doc_date'] = $date->bc_to_ad($data['d_doc_date']);
          $data['d_due_date'] = $date->bc_to_ad($data['d_due_date']);
          $data['f_total_amt'] = str_replace(",", "", $_REQUEST["f_total_amt"]);
          $data['c_yyyy'] = $data['i_yyyy_overlap'] + 543;
          $i_overlap = 0 ; 
          $i_type_bg = 1 ; 
          if ($data['i_booking_bg'] == 2) {
            $i_overlap = 0;
            $i_type_bg = 4 ; 
          }
      
          $sp_torSQL = "INSERT INTO sp_tor (tor_type_id
   ,	c_code
   ,	c_name
   ,	bg_budget_dtl_project_id
   ,	c_budget_dtl_project
   ,	dc_cnt_id
   ,	sp_emp_id
   ,	sp_emp_id2
   ,	sp_emp_id3
   ,	po_creditor_id
   ,	i_purchase
   ,	i_product_type
   ,	i_type_contract
   ,	i_hire_type
   ,	i_is_notor
   ,	i_is_inv
   ,	i_type_fix_rate
   ,	i_delivery_date
   ,	dc_cost_id
   ,	txtsub_cost
   ,	index_receive
   ,	dc_department_id
   ,	i_receive
   ,	d_tor_date
   ,	d_tor_status_date
   ,	d_tor_date_alert
   ,	d_tor_date_pa
   ,	i_alarm_balance
   ,	i_step
   ,	tor_status_id
   ,	tor_status_back_id
   ,	i_forword
   ,	i_backword
   ,	i_is_more
   ,	i_parent
   ,	i_is_rename
   ,	i_is_parent
   ,	i_yyyy
   ,	c_department
   ,	d_doc_ref
   ,	f_period_amt
   ,	f_total_amt
   ,	dc_expense_budget_type_id
   ,	f_type_amt
   ,	i_pr_type1
   ,	bg_reserve_money1_id
   ,	dc_expense_budget_type2_id
   ,	f_type2_amt
   ,	i_pr_type2
   ,	bg_reserve_money2_id
   ,	dc_expense_budget_type3_id
   ,	f_type3_amt
   ,	i_pr_type3
   ,	bg_reserve_money3_id
   ,	dc_expense_budget_type4_id
   ,	f_type4_amt
   ,	i_pr_type4
   ,	bg_reserve_money4_id
   ,	dc_expense_budget_type5_id
   ,	f_type5_amt
   ,	i_pr_type5
   ,	bg_reserve_money5_id
   ,	po_expense_id
   ,	start_date
   ,	end_date
   ,	c_comment
   ,	c_remake
   ,	i_is_pause
   ,	tag
   ,	i_is_complete
   ,	i_is_register
   ,	i_enabled
   ,	i_problem
   ,	c_problem
   ,	dc_user_create_id
   ,	dc_user_create_cost_id
   ,	dc_user_create_department_id
   ,	d_create
   ,	dc_user_update_id
   ,	dc_user_update_cost_id
   ,	dc_user_update_department_id
   ,	d_update
   ,	f_peroid_amt
   ,	i_edit
   ,	dc_cost2_id
   ,	c_pdf
   ,	d_doc_date
   ,	upload
   ,	i_is_upload
   ,	i_menu_edit
   ,	i_type_bg
   ,	sp_type_id
   ,	i_is_request
   ,  i_working_type

  ) SELECT tor_type_id
          ,c_code+'/{$data['c_yyyy']}' as c_code
          ,c_name
          ,bg_budget_dtl_project_id
          ,c_budget_dtl_project
          ,dc_cnt_id
          ,sp_emp_id
          ,sp_emp_id2
          ,sp_emp_id3
          ,po_creditor_id
          ,i_purchase
          ,i_product_type
          ,i_type_contract
          ,i_hire_type
          ,i_is_notor
          ,i_is_inv
          ,i_type_fix_rate
          ,i_delivery_date
          ,dc_cost_id
          ,txtsub_cost
          ,index_receive
          ,dc_department_id
          ,i_receive
          ,d_tor_date
          ,d_tor_status_date
          ,d_tor_date_alert
          ,d_tor_date_pa
          ,i_alarm_balance
          ,i_step
          ,tor_status_id
          ,tor_status_back_id
          ,i_forword
          ,i_backword
          ,i_is_more
          ,tor_id as i_parent
          ,i_is_rename
          ,0 as i_is_parent
          ,{$data['i_yyyy']} as i_yyyy
          ,c_department
          ,d_doc_ref
          ,f_period_amt
          ,{$data['f_total_amt']} as f_total_amt
          ,{$data['dc_expense_budget_type_id']} as dc_expense_budget_type_id
          ,{$data['f_total_amt']} as f_type_amt
          ,{$data['i_pr_type1']} as i_pr_type1
          ,bg_reserve_money1_id
          ,dc_expense_budget_type2_id
          ,f_type2_amt
          ,i_pr_type2
          ,bg_reserve_money2_id
          ,dc_expense_budget_type3_id
          ,f_type3_amt
          ,i_pr_type3
          ,bg_reserve_money3_id
          ,dc_expense_budget_type4_id
          ,f_type4_amt
          ,i_pr_type4
          ,bg_reserve_money4_id
          ,dc_expense_budget_type5_id
          ,f_type5_amt
          ,i_pr_type5
          ,bg_reserve_money5_id
          , {$_REQUEST['po_expense_id']} as  po_expense_id
          ,start_date
          ,end_date
          ,c_comment
          ,c_remake
          ,i_is_pause
          ,tag
          ,i_is_complete
          ,i_is_register
          ,i_enabled
          ,i_problem
          ,c_problem
          ,{$data['dc_user_update_id']} as dc_user_create_id
          ,{$data['dc_user_update_cost_id']} as dc_user_create_cost_id
          ,dc_user_create_department_id
          ,d_create
          ,dc_user_update_id
          ,dc_user_update_cost_id
          ,dc_user_update_department_id
          ,d_update
          ,f_peroid_amt
          ,i_edit
          ,dc_cost2_id
          ,c_pdf
          ,d_doc_date
          ,upload
          ,i_is_upload
          ,i_menu_edit
          ,{$i_type_bg} as i_type_bg 
          ,sp_type_id
          ,i_is_request 
          ,{$data['i_working_type_ID']}
          FROM #temp; ";
  
          $sql = "SET NOCOUNT ON
                       SELECT * into #temp from dbo.sp_tor where tor_id =?"
                  . " {$sp_torSQL} "
                  . " SELECT @@IDENTITY as ret_id;"
                  . " DROP TABLE #temp;";
                  
                //  echo $sql; exit();
  
          $stmt = $db->QueryParam($sql, array($data["sp_tor_id"]));
          $dd_hdr = $db->Fetch($stmt);
          $ret_id = $dd_hdr["ret_id"];
          if ($ret_id) {
              $sp_torSQL = "INSERT INTO sp_tor_contract  
              (parent_id
  , sp_tor_id
  , dc_creditor_id
  , c_code
  , c_name
  , c_doc_ref
  , c_po_no
  , d_doc_date
  , d_po_date
  , d_due_date
  , i_notor
  , i_notification
  , f_total_amt
  , i_is_complete
  , i_status
  , c_discription
  , i_contract_status
  , i_parent
  , i_is_monthly
  , i_is_po
  , i_is_signin
  , i_is_edit
  , d_signin_date
  , i_is_warranty
  , i_is_close
  , close_detail
  , i_is_return
  , d_return_warranty
  , c_return_warranty
  , c_return_comment
  , i_delivery
  , i_is_warranty_book
  , i_type_fine
  , book_no
  , book_seq
  , d_book_date
  , i_is_percen
  , f_percen
  , f_warranty_amt
  , c_remark
  , book_warranty_no
  , d_book_warranty_date
  , dc_bank_id
  , f_fine
  , f_book_warranty_amt
  , d_book_warranty_end
  , c_remark1
  , i_enabled
  , dc_cost_id
  , sp_emp_id
  , d_emp_dt
  , dc_user_create_id
  , dc_user_create_cost_id
  , dc_user_create_department_id
  , d_create
  , dc_user_update_id
  , dc_user_update_cost_id
  , dc_user_update_department_id
  , d_update
  , dc_user_update_cost_id1
  , dc_user_update_department_id1
  , d_update1
  , i_step
  , i_is_period
  , d_cashiercheque_data
  , cashiercheque_on
  , cashiercheque_seq
  , f_warranty_cashiercheque
  , c_remark_cashiercheque
  , dc_expense_budget_type_id
  , f_type_amt
  , i_pr_type1
  , bg_reserve_money1_id
  , dc_expense_budget_type2_id
  , f_type2_amt
  , i_pr_type2
  , bg_reserve_money2_id
  , bg_reserve_i_last1
  , bg_reserve_i_last2
  , i_booking_bg
  , i_yyyy_overlap
  , c_overlap
  , i_overlap
  , bg_reserve_overlap_id
  , sp_type_id
  , dc_expense_budget_type3_id
  , f_type3_amt
  , i_pr_type3
  , bg_reserve_money3_id
  , bg_reserve_i_last3
  , i_is_join_venture
  , bg_budget_dtl_overlap_id
  , i_type_guarantee
  , d_start_date) 
                                  SELECT sp_tor_contract_id as parent_id
          ,{$ret_id} as sp_tor_id
          ,dc_creditor_id
          ,c_code+'/{$data['c_yyyy']}' as c_code
          ,c_name
          ,c_doc_ref
          ,c_po_no
          ,CONVERT(VARCHAR, '{$data['d_doc_date']}', 120) AS d_doc_date
          ,d_po_date
          ,CONVERT(VARCHAR, '{$data['d_due_date']}', 120) AS d_due_date
          ,i_notor
          ,i_notification
          ,{$data['f_total_amt']} as f_total_amt
          ,i_is_complete
          ,i_status
          ,'{$data['c_discription']}' as c_discription
          ,i_contract_status
          ,i_parent
          ,i_is_monthly
          ,i_is_po
          ,i_is_signin
          ,i_is_edit
          ,d_signin_date
          ,i_is_warranty
          ,i_is_close
          ,close_detail
          ,i_is_return
          ,d_return_warranty
          ,c_return_warranty
          ,c_return_comment
          ,i_delivery
          ,i_is_warranty_book
          ,i_type_fine
          ,book_no
          ,book_seq
          ,d_book_date
          ,i_is_percen
          ,f_percen
          ,f_warranty_amt
          ,c_remark
          ,book_warranty_no
          ,d_book_warranty_date
          ,dc_bank_id
          ,f_fine
          ,f_book_warranty_amt
          ,d_book_warranty_end
          ,c_remark1
          ,i_enabled
          ,dc_cost_id
          ,sp_emp_id
          ,d_emp_dt 
                                  ,{$data['dc_user_update_id']} as dc_user_create_id
          ,{$data['dc_user_update_cost_id']} as dc_user_create_cost_id
          ,dc_user_create_department_id
          ,d_create
          ,dc_user_update_id
          ,dc_user_update_cost_id
          ,dc_user_update_department_id
          ,d_update
          ,dc_user_update_cost_id1
          ,dc_user_update_department_id1
          ,d_update1
          ,i_step
          ,i_is_period
          ,d_cashiercheque_data
          ,cashiercheque_on
          ,cashiercheque_seq
          ,f_warranty_cashiercheque
          ,c_remark_cashiercheque
          ,{$data['dc_expense_budget_type_id']} as dc_expense_budget_type_id
          ,{$data['f_total_amt']} as f_type_amt
          ,{$data['i_pr_type1']} as i_pr_type1
          ,bg_reserve_money1_id
          ,dc_expense_budget_type2_id
          ,f_type2_amt
          ,i_pr_type2
          ,bg_reserve_money2_id
          ,bg_reserve_i_last1
          ,bg_reserve_i_last2 
          ,{$data['i_booking_bg']} as i_booking_bg
          ,{$data['i_yyyy_overlap']} as i_yyyy_overlap 
          , c_overlap  
          , {$i_overlap}
          , bg_reserve_overlap_id
          , sp_type_id
          ,dc_expense_budget_type3_id
          ,f_type3_amt
          ,i_pr_type3
          ,bg_reserve_money3_id
          ,bg_reserve_i_last3
          ,i_is_join_venture
          ,bg_budget_dtl_overlap_id
          ,i_type_guarantee
          ,d_start_date
          from #temp2;"; 
              $sql = "SET NOCOUNT ON
                          SELECT * into #temp2 from dbo.sp_tor_contract where sp_tor_contract_id =?"
                      . " {$sp_torSQL} "
                      . " SELECT @@IDENTITY as ret_id2;"
                      . " DROP TABLE #temp2;";  
                      $stmt2 = $db->QueryParam($sql, array($data["sp_tor_contract_id"]));
              $dd_hdr = $db->Fetch($stmt2);
              $ret_id2 = $dd_hdr["ret_id2"];
          }
}

if ($stmt && $stmt2 && $stmt3) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "sp_tor_id" => intVal($ret_id), "sp_tor_contract_id" => intVal($ret_id2));
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;

