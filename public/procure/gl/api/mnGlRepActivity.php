<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php"); 
$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
$mon 	= new mon(); // convert floatval
 
 

	$mode = $_REQUEST["mode"];
	$deleteDtl = false;

	if(isset($_REQUEST["tbl"]) && $_REQUEST["tbl"]=="dtl")
	{
 


		$table 		= "gl_rep_conf_dtl"; 
		$keyName 	= "gl_rep_conf_dtl_id";
		$msg = 'เรียบร้อยแล้ว'; 
		$data = $util->mnUser($_REQUEST); 
		$arrParam = array();		
		$arrParam[] = $data["id"];
		
		 
		 
		$fld = array("gl_rep_conf_id"
					,"dc_acc_id" 
					,"i_source"
					,"i_source_item" 
					,"dc_user_create_id"
					,"dc_user_create_cost_id"
					,"d_create"
					,"dc_user_update_id"
					,"dc_user_update_cost_id"
					,"d_update");
					
		$sql = "DELETE FROM gl_rep_conf_dtl where gl_rep_conf_id =?;";  
		$stmChkMaster = $db->QueryParam($sql, $arrParam); 
		
		if(isset($_REQUEST["dc_acc_id"]) && is_array($_REQUEST["dc_acc_id"]))
foreach($_REQUEST["dc_acc_id"] as $id => $group){
			
	foreach($group as $k => $dc_acc_id)
		{
		   
				$arrParam = array();		
				$addField = "";
				$addValue = ""; 
				$data["dc_acc_id"] = $dc_acc_id;
				$data["gl_rep_conf_id"] = $data["id"];
				
				$data["i_source"] = $data["sub_i_source{$dc_acc_id}"];
				
				$data["i_source_item"] = $data["i_source"]==1?$data["sub_i_source_item1Name{$dc_acc_id}"]:$data["sub_i_source_item2Name{$dc_acc_id}"];
				
				
				/* echo "{$data["dc_acc_id"]} , {$data["i_source"]} , {$data["i_source_item"]}"; exit(); */
				 
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
				$stmChkMaster = $db->QueryParam($sql, $arrParam);  	
		}
					
}

	}else{
	
	
	
	if(isset($_REQUEST["mode"]) && $_REQUEST["mode"]!="DELETE"){
		
		if($_REQUEST["i_show"]==1 || $_REQUEST["i_show"]==3 || $_REQUEST["i_show"]==8 || $_REQUEST["i_show"]==9){
                        
			$_REQUEST["i_source"] = null;
			$_REQUEST["i_source_item"] = null;
			$_REQUEST["f_total"] = null;
			$deleteDtl = true;
			
	
		}else{
			$_REQUEST["f_total"] = $mon->parseFloat($_REQUEST["f_total"]);  
			if(isset($_REQUEST["i_source"]) && $_REQUEST["i_source"]==1){
						$_REQUEST["i_source_item"] = $_REQUEST["i_source_item1"];
					}else{ 
						$_REQUEST["i_source_item"] = $_REQUEST["i_source_item2"]; 
			}
		}
	}
	
		//gl_rep_conf 
		$table 		= "gl_rep_conf"; 
		$keyName 	= "gl_rep_conf_id";
		$msg = 'เรียบร้อยแล้ว'; 
		$data = $util->mnUser($_REQUEST); 
		
                        

		$fld = array("gl_dc_activity_id"
					,"c_name" 
					,"i_source"
					,"i_source_item"
					,"i_level"
					,"i_show"
					,"i_row" 
					,"f_total" 					
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
					$data['i_enable']    	= STATUS_ENABLE; 
			}	
 
		$db->BeginTran();
		$stmChkMaster 	= true; // as so 
		$stmChkDelDtl 	= true; // as dtl
		
		switch ($mode) {
			
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
							$data['mode'] 	= "addEdit";
							$data['id'] 	= $ret["id"]; 
							
							$returnData     = $data;  
							$log = "Add arSoHdr";
							
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
					}else if($value=="i_source" 
					|| $value=="i_source_item" || $value=="f_total" 
                                        || $value=="gl_dc_activity_id")
					{
						$upField .= ", {$value} = ?";
						$arrParam[] = $data[$value];
					}
					
				}
				
				if($deleteDtl){		
				
					
						$sqlDtl = "DELETE FROM gl_rep_conf_dtl where gl_rep_conf_id =?";
						$arrParam1[] = $data["id"]; 
						$stmChkMaster = $db->QueryParam($sqlDtl, $arrParam1);
				 }		
						//
						
				
				
					
					$sql = "UPDATE {$table} SET ".substr($upField, 1)." WHERE {$keyName} = ?"; 
					$arrParam[] = $data["id"]; 
					$stmChkMaster = $db->QueryParam($sql, $arrParam);
			 
				
				
				
						$returnData = array('status'=>'delete','enabledDelete'=>false);
						
				$returnData     = array("id"=>$data["id"]);  
				$log = "Update arSoHdr";
			break;
		 
			case "DELETE" : 
				$sql = "Declare @idx as bigint;
								set @idx = ?; 
								DELETE FROM gl_rep_conf where gl_rep_conf_id =@idx;
								DELETE FROM gl_rep_conf_dtl where gl_rep_conf_id =@idx;
								"; 
							
						$arrParam = array($data["id"]); 
						$stmChkMaster = $db->QueryParam($sql, $arrParam);
						$returnData = array('status'=>'delete','enabledDelete'=>false);
						
				/* if($_REQUEST['i_enable']==1 && $_REQUEST["c_gx_code"]=='0'){
						$sql = "Declare @idx as bigint;
								set @idx = ?; 
								DELETE FROM gl_rep_conf_hdr where gl_rep_conf_hdr_id =@idx;
								DELETE FROM gl_rep_conf_dtl where gl_rep_conf_hdr_id =@idx;
								"; 
							
						$arrParam = array($data["id"]); 
						$stmChkMaster = $db->QueryParam($sql, $arrParam);
						$returnData = array('status'=>'delete','enabledDelete'=>false);
				}else{
					if(enabledDelete($_REQUEST["c_gx_code"])){
					
						$sql = "Declare @idx as bigint;
								set @idx = ?; 
								UPDATE gl_rep_conf_hdr  SET i_enable=2 where gl_rep_conf_hdr_id =@idx;
								"; 
							
						$arrParam = array($data["id"]); 
						$stmChkMaster = $db->QueryParam($sql, $arrParam);
						$returnData = array('status'=>'remove','enabledDelete'=>true);
					}else{
						 
					$msg = 'ไม่สามารถยกเลิกรายการได้ เนื่องจากยกต้องไปเลิก GX เลขที่ '.$_REQUEST["c_gx_code"].'  ที่เมนูของสมุดรายวันก่อน'; 
					$returnData = array('status'=>'notice','enabledDelete'=>false);
					
					} 
				} */
				
			break;  
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
echo json_encode($re); exit; 

?>