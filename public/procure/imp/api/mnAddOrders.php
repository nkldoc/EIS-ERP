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
 
$mode		= $_REQUEST["mode"];
$table 		= "imp_receive_hdr";
$keyName 	= "imp_receive_hdr_id";
 
$data = $util->mnUser($_REQUEST); 
$c_code_mu = "IMP"; 
$arr_status = array(null=>"ยังไม่ออกเลข SO",1=>"ออกเลข SO",2=>"",3=>"สมบูรณ์(เต็มใบ)",4=>"สมบูรณ์(ยกเลิกบางส่วน)"); 

$fld = array("c_code"
			,"c_gx_code"
            ,"c_receive_period_no" 
            ,"c_point_receive_name"    
            ,"d_doc_date"   
            ,"c_comment" 
            ,"i_enable"  
			,"i_post"
            ,"dc_user_create_id"
            ,"dc_user_create_cost_id"
            ,"d_create"
            ,"dc_user_update_id"
            ,"dc_user_update_cost_id"
            ,"d_update");
     
//Inteliz
if($mode=='ADD' || $mode=='EDIT')
{ 
        $data['d_doc_date'] 	= $date->bc_to_ad($data['d_doc_date']); 
        $data['i_enable']    	= STATUS_ENABLE; 
}	

$db->BeginTran();
$stmChkMaster 	= true; // as so 
$stmChkDelDtl 	= true; // as dtl
 
  
switch ($mode) { 
	case "GENCODE" : 
                        
   // $row        = $db->GetDataBySQL("select * from ar_so_hdr where ar_so_hdr_id = ?",array($_REQUEST['id']));
   
   $check = 0;
    
    if($check){ 
        $ret = array("stm" => true , "log"  => "Invalid Check" , "data" => array("msg"=>$msg));   
    } else {

        $ret_id 	= $_REQUEST["id"];   
        $code_dc 	= (string) $c_code_mu;
        $arrParam  	= array($code_dc,date("Ym"),$data['dc_user_update_id'],$data['dc_user_update_cost_id'],$ret_id); 
        $sql	= "EXEC SP_GEN_CODE ?,?,?,?,?;"; 
        $stmt           = $db->QueryParam($sql,$arrParam); 
        $arr_gen_code   = $db->Fetch($stmt);
        $c_code 	= $arr_gen_code["c_code_gen"];
        $ref_id   	= $arr_gen_code["reference_id"]; 

        if ($ret_id==$ref_id)
        {
            $sql2 = "UPDATE {$table}
            SET c_code=? 
			,i_is_status =?
            ,dc_user_update_id =?
            ,dc_user_update_cost_id =?
            ,d_update =?
            WHERE {$keyName} = ?"; 
            $arrParam2= array($c_code
					, 1
                    , $_SESSION["user_id"]
                    , $_SESSION["dc_cost_id"]
                    , date("Y-m-d H:i:s")
                    ,$ret_id);
            $stmt2 = $db->QueryParam($sql2,$arrParam2);

        }
           $msg = ''; 
           $ret = array("stm" =>$stmt
                    ,"log"  => ""
                    ,"data" => array("c_code" =>$c_code, "msg" =>$msg)
               );   
							$returnData     = array("id"=>$ret_id,"c_code" =>$c_code, "msg" =>"เรียบร้อย");  
							$log = "GENCODE arSoHdr";   
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
            } 
		}
		$sql = "UPDATE {$table} SET ".substr($upField, 1)." WHERE {$keyName} = ?"; 
		$arrParam[] = $data["id"];
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
							$returnData     = array("id"=>$data["id"]);  
							$log = "Update arSoHdr";
	break;
	case "DELETE" :  
		$sql = "Declare @idx as bigint;
				set @idx = ?; 
					delete from ar_so_hdr where ar_so_hdr_id =@idx;
					delete from ar_so_dtl where ar_so_hdr_id =@idx;"; 
            
		$arrParam = array($data["id"]); 
	$stmChkMaster = $db->QueryParam($sql, $arrParam);
	break;
}
        
	if ($stmChkMaster)
	{
		$db->CommitTran();
		$re = array("reval"=>0,"success"=>"Success","msg"=>"บันทึกเรียร้อย","data"=>@$returnData,"log"=>@$log);
	}
	else
	{
		$db->RollBackTran();
		$re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
	}
	echo json_encode($re); exit; 
?>
