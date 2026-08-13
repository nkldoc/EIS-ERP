<?php
include("../../gl/conf/configGl.php");
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php"); 
$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
$mon 	= new mon(); // convert floatval
 
$mode		= $_REQUEST["mode"];
$table 		= "fi_receive_tran_hdr";
$keyName 	= "fi_receive_tran_hdr_id";


$data = $util->mnUser($_REQUEST); 
$c_code_mu = "REC"; 
$arr_status = array(null=>"ยังไม่ออกเลข BL",1=>"ออกเลข BL",2=>"วางบิลไปแล้วบางส่วน",3=>"สมบูรณ์(เต็มใบ)",4=>"สมบูรณ์(ยกเลิกบางส่วน)"); 
$fld = array("ar_bill_invoice_hdr_id" 
			,"ar_so_hdr_id"
			,"c_code"
			,"c_name"
			,"dc_debtor_id"
			,"dc_cost_id"
			,"dc_area_id"
			,"receipt_book"
			,"receipt_book_no"
			,"d_doc_date"
			,"fi_pymt_voucher_type_id"
			,"dc_bank_acc_company_id"
			,"dc_bank_acc_id"
			,"dc_bank_id"
			,"dc_bank_branch_id" 
			,"c_cheq_code"
			,"d_cheq_date"
			,"c_remark"
			,"f_total_cost"
			,"f_disc_amt"
			,"f_before_edit_vat"
			,"f_tax_amt"
			,"f_vat_amt"
			,"f_net_cost"
			,"i_is_status"
			,"c_comment" 
			,"json_print_dtl" 
            ,"i_enable"  
            ,"dc_user_create_id"
            ,"dc_user_create_cost_id"
            ,"d_create"
            ,"dc_user_update_id"
            ,"dc_user_update_cost_id"
            ,"d_update");
$fld2 = array("fi_receive_tran_hdr_id"
            ,"ar_bill_invoice_dtl_id"
            ,"dc_product_id"
            ,"dc_tax_id"
            ,"f_tax_amt"
            ,"f_quan"
            ,"i_seq"
            ,"f_unit_cost"
            ,"f_total_cost"
            ,"f_disc_com"
            ,"f_disc_cash"
            ,"f_net_cost"
			,"c_comment"  
            ,"i_enable"  
            ,"dc_user_create_id"
            ,"dc_user_create_cost_id"
            ,"d_create"
            ,"dc_user_update_id"
            ,"dc_user_update_cost_id"
            ,"d_update"); 
 	
//Inteliz
if($mode=='ADD' || $mode=='EDIT')
{ 
  
		if(isset($data['fi_pymt_voucher_type_id']) && $data['fi_pymt_voucher_type_id']==2){
			
			$data['d_cheq_date'] 			= $date->bc_to_ad($data['d_cheq_date']);  
			$data['dc_bank_acc_company_id'] = null;
			
		}else if(isset($data['fi_pymt_voucher_type_id']) && $data['fi_pymt_voucher_type_id']==3){ 
		
			$data['d_cheq_date'] 			= null;
			$data['c_cheq_code'] 			= null;
			$data['dc_bank_id'] 			= null;
			$data['dc_bank_branch_id'] 		= null; 
			
		}else{
			$data['d_cheq_date'] 			= null;
			$data['c_cheq_code'] 			= null;
			$data['dc_bank_id'] 			= null;
			$data['dc_bank_branch_id'] 		= null;
			$data['dc_bank_acc_company_id'] = null;
		}
		
		$data['d_doc_date'] 		= $date->bc_to_ad($data['d_doc_date']);
        $data['i_enable']    		= STATUS_ENABLE;  
		 
		// print_r($data); exit; 
}	



$db->BeginTran();
$stmChkMaster 	= true; // as so 
$stmChkDelDtl 	= true; // as dtl
$msg="บันทึกเรียร้อย";

switch ($mode) { 

	case "CHECKCLOSEBILLING" :  
 
		$valid = 0;
		
		if(isset($_REQUEST['check']) && $_REQUEST['check']=='edit')$data['d_doc_date'] = $date->bc_to_ad($data['d_doc_date']);
		
		$m = explode("-",$data['d_doc_date']);
		$c_yyyy = $m[0];
		$c_mm = $m[1];
	 
		$sqlM = "select * from gl_dc_period where c_mm='{$c_mm}' and c_yyyy='{$c_yyyy}' and i_system=".GL_PERIOD_SYSTEM_AR." and i_last_period=1 and i_status=?";			
/*
สถานะ(null=>ยังไม่ออกเลข SO,1=>ออกเลข SO ,2=>รัับเงินไปแล้วบางส่วน,3=>รับเงินสมบูรณ์(เต็มใบ),4=>รับเงินสมบูรณ์(ยกเลิกบางส่วน)); 
*/		
	 
		$fm = $db->GetDataBySQL($sqlM, array(2)); //check Close 2 check Open 1;	 
 
		if($fm['i_status']==2) //
		{
			$valid +=1;
			$mth = $date->l_month_thai["{$c_mm}"];
			$yth = ($c_yyyy/1)+543;
			$msg = "ไม่สารถเพิ่มหรือแก้ไข/ลบ เนื่องจากทางบัญชีได้ปิด เดือน {$mth} ปี พ.ศ. {$yth}";
			$returnData = array("invalid"=>1);   
 
		}else{
			$returnData = array("invalid"=>0,'m'=>$fm);
		}
	 
	    break;

	case "ADD" :  
		$arrParam = array();		
		$addField = "";
		$addValue = ""; 
		foreach($fld as $value)
		{  
			if(!empty($data[$value]))
			{ 
				$addField .= ", {$value}";
				$addValue .= ", ?";
				$arrParam[] = $data[$value];
			} 
		}  
		$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";  
		$sql.="SELECT @@IDENTITY as id";  
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
		
		if ($stmChkMaster)
		{
			$next_result = $db->NextResult($stmChkMaster);
			if( $next_result )
			{
					$ret= $db->Fetch($stmChkMaster);
					
					$ret_id = $ret["id"]; 
					$returnData     = array("id"=>$ret_id);  
					
					$log = "Add arREC-Hdr"; 
					$sql = "UPDATE ar_bill_invoice_hdr
                                        SET i_is_status=?
                                        ,dc_user_update_id =?
                                        ,dc_user_update_cost_id =?
                                        ,d_update =?
                                        WHERE ar_bill_invoice_hdr_id = ?; 
                            ";  
					$arrParam= array(3
									, $_SESSION["user_id"]
									, $_SESSION["dc_cost_id"]
									, date("Y-m-d H:i:s") 
									, $data["ar_bill_invoice_hdr_id"]);   
					$stmChkMaster = $db->QueryParam($sql, $arrParam);
				
			/* add Dtl*/
			
				
			$sqlMain ="select * 
			,isnull(ar_bill_invoice_dtl.dc_product_id,(select dc_product_id from ar_so_dtl where ar_so_dtl_id=ar_bill_invoice_dtl.ar_so_dtl_id)) as dc_product_id	
			from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id=?";
			$stmt = $db->QueryParam($sqlMain, array($data["ar_bill_invoice_hdr_id"]));
			while($f1 =$db->Fetch($stmt))				
			{
				$arrParam = array();		
				$addField = "";
				$addValue = "";  
				
				
				
				$data['fi_receive_tran_hdr_id'] = $ret_id;
				$data['ar_bill_invoice_dtl_id'] = $f1['ar_bill_invoice_dtl_id'];
				$data['ar_bill_invoice_hdr_id'] = $f1['ar_bill_invoice_hdr_id'];
				$data['ar_so_dtl_id'] 	= $f1['ar_so_dtl_id'];
				$data['dc_product_id'] 	= $f1['dc_product_id'];
				$data['dc_tax_id'] 		= $f1['dc_tax_id'];
				$data['f_tax_amt'] 		= $f1['f_tax_amt'];
				$data['i_seq'] 			= $f1['i_seq'];
				$data['f_quan']			= $f1['f_quan'];
				$data['f_unit_cost'] 	= $f1['f_unit_cost'];
				$data['f_total_cost'] 	= $f1['f_total_cost'];
				$data['f_disc_com'] 	= $f1['f_disc_com'];
				$data['f_disc_cash'] 	= $f1['f_disc_cash'];
				$data['f_net_cost'] 	= $f1['f_net_cost'];
				$data['c_comment'] 		= $f1['c_comment'];
				
				foreach($fld2 as $value)
				{ 
					 
					$addField .= ", {$value}";
					$addValue .= ", ?";
					$arrParam[] = $data[$value];
					 					
				} 
				$sql = "INSERT INTO fi_receive_tran_dtl (".substr($addField, 1).") VALUES (".substr($addValue,1).")";  
				$sql.="SELECT @@IDENTITY as id";  
				
 
				$stmChkMaster = $db->QueryParam($sql, $arrParam);
				
				} //if($stmChkMaster)
			} 
		}
	break;
        case "EDIT" : 
		$arrParam = array();
		$upField = "";
		
		$data['d_create'] = null; //No Update
		foreach($fld as $value)
		{
			if (!empty($data[$value]))
			{ 
				$upField .= ", {$value} = ?";
				$arrParam[] = $data[$value];         
            }else if($value=='c_cheq_code' 
				|| $value=='dc_bank_acc_company_id'  
				|| $value=='dc_bank_branch_id'  
				|| $value=='dc_bank_id'  
				|| $value=='d_cheq_date'  
				|| $value=='c_remark'){
					$upField .= ", {$value} = ?";
					$arrParam[] = null; 				
			} //  
		}
		$sql = "UPDATE {$table} SET ".substr($upField, 1)." WHERE {$keyName} = ?"; 
		$arrParam[] = $data["id"];
 
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
		$returnData     = array("id"=>$data["id"]);  
		$log = "Update arRecHdr";
		
	break;
	case "DELETE" : 
	$stmChkMaster = true;
	$valid 			= 0; 
	$f1 = $db->GetDataBySQL("select year(a.d_doc_date) as c_yyyy, month(a.d_doc_date) as c_mm 
	, a.ar_so_hdr_id
	, a.ar_bill_invoice_hdr_id
								from fi_receive_tran_hdr a 
								where a.fi_receive_tran_hdr_id=?", array($data["id"]));
	
 
	$c_mm 	= sprintf("%02d", $f1['c_mm']);
	$c_yyyy = sprintf("%02d", $f1['c_yyyy']);
	
	if($data["statusBu"]=='del'){
		
		// ยังไม่ออกเลย ar && bl 
		$sql = "Declare @idx as bigint;  
						set @idx = ?;  
						delete from fi_receive_tran_hdr where fi_receive_tran_hdr_id =@idx; 
						delete from fi_receive_tran_dtl where fi_receive_tran_hdr_id =@idx; 
						"; 
		$arrParam = array($data['id']);
		
		$msg = "ท่านได้ลบเรียบร้อยแล้ว"; 
		$returnData = array("invalid"=>0); 
		$stmChkMaster = $db->QueryParam($sql, $arrParam);    
				$sql = "UPDATE ar_bill_invoice_hdr
                                        SET i_is_status=?
                                        ,dc_user_update_id =?
                                        ,dc_user_update_cost_id =?
                                        ,d_update =?
                                        WHERE ar_bill_invoice_hdr_id = ?; 
                            ";  
					$arrParam= array(1
									, $_SESSION["user_id"]
									, $_SESSION["dc_cost_id"]
									, date("Y-m-d H:i:s") 
									, $data["ar_bill_invoice_hdr_id"]);   
					$stmChkMaster = $db->QueryParam($sql, $arrParam);		
                        
     }else if($data["statusBu"]=='cancel'){
 
 
			$sql = "UPDATE ar_bill_invoice_hdr
						SET i_is_status=?
						,dc_user_update_id =?
						,dc_user_update_cost_id =?
						,d_update =?
						WHERE ar_bill_invoice_hdr_id = ?; 
					";
					
			$sql .= "UPDATE fi_receive_tran_hdr
							SET i_enable=?
							,dc_user_update_id =?
							,dc_user_update_cost_id =?
							,d_update =?
							WHERE fi_receive_tran_hdr_id = ?; 
                        "; 	
							
			$arrParam= array(1
							, $_SESSION["user_id"]
							, $_SESSION["dc_cost_id"]
							, date("Y-m-d H:i:s") 
							, $data["ar_bill_invoice_hdr_id"]
							, STATUS_DISABLE
							, $_SESSION["user_id"]
							, $_SESSION["dc_cost_id"]
							, date("Y-m-d H:i:s") 
							, $data["id"]);   
			$stmChkMaster = $db->QueryParam($sql, $arrParam);	
			$db->QueryParam("EXEC SP_AR_PROCESS_MONTH_REPORT_DELETE_RECEIVE ? ,?", array($data["ar_bill_invoice_hdr_id"],$data["id"])); 
 
			
		$msg = "ท่านได้ยกเลิกเรียบร้อยแล้ว"; 
		$returnData = array("invalid"=>0); 
		$stmChkMaster = $db->QueryParam($sql, $arrParam);     

		
		}else{
				echo "โปรดตรวจสอบอีกครั้ง";
				exit;
		}//End
		
	break;
}

 
	  
	if ($stmChkMaster)
	{
		$db->CommitTran();
		$re = array("reval"=>0,"success"=>"Success","msg"=>$msg,"data"=>@$returnData,"log"=>@$log);
	}
	else
	{
		$db->RollBackTran();
		$re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
	}
	echo json_encode($re); exit; 
?>
