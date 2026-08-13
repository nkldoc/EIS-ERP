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
$table 		= "ar_bill_invoice_hdr";
$keyName 	= "ar_bill_invoice_hdr_id";


$data = $util->mnUser($_REQUEST); 
$c_code_mu = "BL"; 
$arr_status = array(null=>"ยังไม่ออกเลข BL",1=>"ออกเลข BL",2=>"วางบิลไปแล้วบางส่วน",3=>"สมบูรณ์(เต็มใบ)",4=>"สมบูรณ์(ยกเลิกบางส่วน)"); 
$fld = array("c_code"
			,"bl_code" 
			,"ar_so_hdr_id"
			,"dc_debtor_id"
			,"i_is_status"
			,"f_vat_rate"
			,"dc_vat_id"
			,"dc_cost_id"
			,"dc_area_id"
			,"c_name_inv"
			,"c_address_inv"
			,"due_bill"
			,"condition_pay"
			,"d_endpay_date"
			,"d_billing_date"
			,"d_doc_date"
			,"i_no_order"
			,"c_invoice_item"
			,"c_comment"
			,"json_print_hdr"
			,"json_print_dtl"
			,"html_print" 
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
        $data['d_doc_date'] 		= $date->bc_to_ad($data['d_doc_date']);
		$data['d_billing_date'] 	= $date->bc_to_ad($data['d_billing_date']);
		$data['d_endpay_date'] 		= $date->bc_to_ad($data['d_endpay_date']);
        $data['i_enable']    		= STATUS_ENABLE; 
}	

/* print_r($data); exit; */  

$db->BeginTran();
$stmChkMaster 	= true; // as so 
$stmChkDelDtl 	= true; // as dtl
$msg="บันทึกเรียร้อย";

switch ($mode) { 

	case "CHECKCLOSEBILLING" :  
 
		$valid = 0;
		
		if(isset($_REQUEST['check']) && $_REQUEST['check']=='edit')$data['d_billing_date'] = $date->bc_to_ad($data['d_billing_date']);
		
		$m = explode("-",$data['d_billing_date']);
		$c_yyyy = $m[0];
		$c_mm = $m[1];
	 
		$sqlM = "select * from gl_dc_period where c_mm='{$c_mm}' and c_yyyy='{$c_yyyy}' and i_system=".GL_PERIOD_SYSTEM_AR." and i_last_period=1 and i_status=?";			
/*
สถานะ(null=>ยังไม่ออกเลข SO,1=>ออกเลข SO ,2=>รัับเงินไปแล้วบางส่วน,3=>รับเงินสมบูรณ์(เต็มใบ),4=>รับเงินสมบูรณ์(ยกเลิกบางส่วน));

*/		
		$sqlB ="select * from ar_bill_invoice_hdr where i_is_status in (2,3,4) and ar_bill_invoice_hdr_id=?";
		
		$fm = $db->GetDataBySQL($sqlM, array(2)); //check Close 2 check Open 1;	 
		$f1 = $db->GetDataBySQL($sqlB, array($_REQUEST['id']));
		
		if($fm['i_status']==2) //
		{
			$valid +=1;
			$mth = $date->l_month_thai["{$c_mm}"];
			$yth = ($c_yyyy/1)+543;
			$msg = "ไม่สารถเพิ่มหรือแก้ไข Invoice เนื่องจากทางบัญชีได้ปิดการวางบิลหรือแก้ไขได้ใน  เดือน {$mth} ปี พ.ศ. {$yth}";
			$returnData = array("invalid"=>1);   
		}else if($f1['i_is_status']){
			$msg = "ไม่สารถเพิ่ม/ลบ/แก้ไข Invoice เนื่องจากบิลใบนี้ัได้มีการรับเงินไปแล้ว";
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
			if( $next_result ) {
							$ret= $db->Fetch($stmChkMaster);
							$ret_id = $ret["id"]; 
							$returnData     = array("id"=>$ret_id);  
							$log = "Add arBLHdr";
							//$stmChkMaster = false; //restore
							  
                        }
                } 
	break;
        case "EDIT" : 
		$arrParam = array();
		$upField = "";
		foreach($fld as $value)
		{
			if (!empty($data[$value]))
			{ 
				$upField .= ", {$value} = ?";
				$arrParam[] = $data[$value];                 
            }else if($value=='f_vat_rate'){
				$upField .= ", {$value} = ?";
				$arrParam[] = 0; 
            }else if($value=='c_contract_no' || $value=='d_contract_date' 
				|| $value=='due_bill' || $value=='condition_pay' || $value=='c_name_inv' || $value=='c_address_inv'
				|| $value=='c_comment'){
					$upField .= ", {$value} = ?";
					$arrParam[] = null; 				
			}
		}
		$sql = "UPDATE {$table} SET ".substr($upField, 1)." WHERE {$keyName} = ?"; 
		$arrParam[] = $data["id"];
		
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
							$returnData     = array("id"=>$data["id"]);  
							$log = "Update arBillHdr";
							
	break;
	case "DELETE" : 
	$stmChkMaster = true;
	$valid 			= 0; 
	$f1 = $db->GetDataBySQL("select year(b.d_billing_date) as c_yyyy, month(b.d_billing_date) as c_mm
	, a.ar_so_dtl_id
	, b.ar_so_hdr_id
	, b.ar_bill_invoice_hdr_id
								from ar_bill_invoice_dtl a 
								inner join ar_bill_invoice_hdr b on b.ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id
								where a.ar_bill_invoice_hdr_id=?", array($data["id"]));
	
 
	$c_mm 	= sprintf("%02d", $f1['c_mm']);
	$c_yyyy = sprintf("%02d", $f1['c_yyyy']);
	
	if($data["statusBu"]=='del'){
		
		// ยังไม่ออกเลย ar && bl 
		$sql = "Declare @idx as bigint;
				Declare @idDtl as bigint;
				
						set @idx = ?; 
						set @idDtl=?;
						delete from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id 		=@idx;
						delete from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id 		=@idx; 
						update ar_so_dtl set i_billing = null where ar_so_dtl_id			=@idDtl; 
						"; 
		$arrParam = array($data['id'],$f1['ar_so_dtl_id']);
		
		$msg = "ท่านได้ลบเรียบร้อยแล้ว"; 
		$returnData = array("invalid"=>0); 
		$stmChkMaster = $db->QueryParam($sql, $arrParam);     
                   
     }else if($data["statusBu"]=='cancel'){
 
			$sql = "UPDATE ar_bill_invoice_hdr
                                        SET i_enable=?
                                        ,dc_user_update_id =?
                                        ,dc_user_update_cost_id =?
                                        ,d_update =?
                                        WHERE ar_bill_invoice_hdr_id = ?; 
                            ";  
			$arrParam= array(STATUS_DISABLE
							, $_SESSION["user_id"]
							, $_SESSION["dc_cost_id"]
							, date("Y-m-d H:i:s") 
							, $data["id"]);   
			$stmChkMaster = $db->QueryParam($sql, $arrParam);
			//========================================================================================
		/* print_r($f1); exit;	 */
		$sql = "Declare @idx as bigint;
				Declare @idDtl as bigint;
				Declare @idHdr as bigint;
				
						set @idx = ?; 
						set @idDtl=?;
						set @idHdr=?;
						delete from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id 		=@idx; 
						update ar_so_dtl set i_billing = null where ar_so_dtl_id			=@idDtl; 
						update ar_so_hdr set i_is_status = 1 where ar_so_hdr_id				=@idHdr; 
						
						"; 
		$arrParam = array($data['id'],$f1['ar_so_dtl_id'],$f1['ar_so_hdr_id']); 
		$msg = "ท่านได้ลบเรียบร้อยแล้ว"; 
		$returnData = array("invalid"=>0); 
		$stmChkMaster = $db->QueryParam($sql, $arrParam);     
			
 			//========================================================================================

			$msg = "ท่านได้ยกเลิกเรียบร้อยแล้ว"; 
			$returnData = array("invalid"=>0); 
			$stmChkMaster = $db->QueryParam($sql, $arrParam);  
			$db->QueryParam("EXEC SP_AR_PROCESS_MONTH_REPORT_DELETE_BL ?", array($data["id"])); 
		  
		 
		 
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
