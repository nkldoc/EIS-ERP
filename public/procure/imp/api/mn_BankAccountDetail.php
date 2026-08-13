<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

$table 		= "imp_bank_account_detail_hdr";

$msg = 'เรียบร้อยแล้ว'; 

$fld = array("dc_bank_id"
			,"dc_bank_acc_company_id"
			,"c_doc"
            ,"d_doc_date"   
			,"i_book_type"
            ,"c_comment" 
            ,"i_enable"
            ,"dc_user_create_id"
            ,"dc_user_create_cost_id"
            ,"d_create"
            ,"dc_user_update_id"
            ,"dc_user_update_cost_id"
            ,"d_update");

			
$data = $util->mnUser($_REQUEST); 
//Inteliz
if($mode=='ADD' || $mode=='EDIT')
{ 
        $data['d_doc_date'] 	= $date->bc_to_ad($data['d_doc_date']); 
        $data['i_enable']    	= STATUS_ENABLE; 
}

switch ( $mode ) {
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
				$log = "Add imp_bank_account_detail_hdr";
					
			}
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
	break;
	case "EDIT" :  
		$arrParam = array();		
		$addField = "";
		$addValue = ""; 
		foreach($fld as $value)
		{  
			if(!empty($data[$value]))
			{ 
				$addValue .= ", {$value} = ?";
				$arrParam[] = $data[$value];
			} 
		}  
		$arrParam[] = $_REQUEST["id"];
		$sql = "UPDATE {$table} SET ".substr($addValue,1)." WHERE imp_bank_account_detail_hdr_id = ?"; 
		$stmChkMaster = $db->QueryParam($sql, $arrParam); 
		
		$log = "EDIT imp_bank_account_detail_hdr";
		$returnData     = array("id"=>$_REQUEST["id"]);  
		
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
	break;
	case "SAVE_STATEMENT" :
	
		$table	= "imp_bank_account_detail_dtl";
		$sql_acc = "select dc_acc_id from dc_bank_acc_company a
					inner join imp_bank_account_detail_hdr b on a.dc_bank_acc_company_id = b.dc_bank_acc_company_id
					where imp_bank_account_detail_hdr_id = ?";
		$dc_acc_id = $db->GetDataBySQL($sql_acc, array($_REQUEST["hdr_id"]));
		
		$sql		= "DELETE FROM {$table} WHERE imp_bank_account_detail_hdr_id = ".$_REQUEST["hdr_id"]."; ";
		$para		= $db->QueryParam($sql, array());
		if($para) {
	
			$data_dtl	= json_decode(@$_REQUEST["data"], true);
			
            $dc_user_update_id = $data["dc_user_update_id"];
            $dc_user_update_cost_id = $data["dc_user_update_cost_id"];
            $d_update = $data["d_update"];
			$data 		= array();
			if(is_array($data_dtl) && count($data_dtl) > 0) {
				foreach($data_dtl as $index => $jObj) {

					$data["imp_bank_account_detail_hdr_id"]	= $_REQUEST["hdr_id"];
					$data["dc_acc_id"]						= $dc_acc_id;
					$data["f_dr"]							= ($jObj["f_dr"] == "")? '0' : $jObj["f_dr"]; // Default value 0
					$data["f_cr"]							= ($jObj["f_cr"] == "")? '0' : $jObj["f_cr"]; // Default value 0
					$data["c_comment"]						= $jObj["c_comment"];
					$data["i_status"]						= 1;//ปกติ
					$data["dc_user_update_id"]				= $dc_user_update_id;
					$data["dc_user_update_cost_id"]			= $dc_user_update_cost_id;
					$data["d_update"]						= $d_update;
	
					foreach($data as $fld => $val) {
						$arrValue[] = ($val != "")? $val : NULL;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}
	
					$sql .= "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
	
					// ============== //
					$addField	= null;
					$addValue	= null;
					unset ($data);
					// ============== //
				}
				$para	= $db->QueryParam($sql, $arrValue);
				
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
				
				if($para) {
					$re = array("id"		=> $_REQUEST["hdr_id"],
								"success"	=> true );
				} else {
					$re = array("success"	=> false );
				}
				echo json_encode($re);
				exit;
			}
		}

	break;
	case "DELETE" :
		$sql = "DECLARE @hdr_id AS BIGINT;
				SET @hdr_id = ?;
				DELETE FROM imp_bank_account_detail_dtl where imp_bank_account_detail_hdr_id = @hdr_id;
				DELETE FROM imp_bank_account_detail_hdr where imp_bank_account_detail_hdr_id = @hdr_id;
				";
		$arrParam = array($data["id"]);
		$stmt = $db->QueryParam($sql, $arrParam);
		
		$log = "DELETE imp_bank_account_detail_hdr & imp_bank_account_detail_dtl By hdr_id={$data["id"]}";
		if ($stmt)
		{
			$db->CommitTran();
			$re = array("reval"=>0,"success"=>true,"msg"=>$msg,"log"=>@$log);
		}
		else
		{
			$db->RollBackTran();
			$re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
		}
	break;
}
echo json_encode($re);
exit;
?>