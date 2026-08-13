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
$table 		= "ar_so_dtl";
$keyName 	= "ar_so_dtl_id";
 
$data = $util->mnUser($_REQUEST);  

$fld = array("ar_so_hdr_id"
                    ,"dc_product_id"
                    ,"i_seq" 
                    ,"f_quan" 
					,"f_unit_cost" 
					,"f_total_cost"
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
    $f1 = $db->GetDataBySQL("select dc_user_create_id"
           . ", dc_user_create_cost_id"
           . ", convert(varchar, d_create, 120) as d_create" 
           . ",(select count(*)+1 from ar_so_dtl where ar_so_hdr_id=ar_so_hdr.ar_so_hdr_id) as i_seq"
           . " from ar_so_hdr "
           . "where ar_so_hdr_id=?", array($data['hdrID']));

		   $data['ar_so_hdr_id']   = $data['hdrID'];
		   $data['i_seq']          = $f1['i_seq'];   
		   $data['i_enable']       = 1; 
		   
		   
		   $data['dc_user_create_id']      = $f1['dc_user_create_id'];   
		   $data['dc_user_create_cost_id'] = $f1['dc_user_create_cost_id']; 
		   $data['d_create']               = $f1['d_create']; 
}
        

$db->BeginTran();
$stmChkMaster 	= true; // as so 
$stmt2  		= true;       


switch ($mode) {

	case "ADD" :  
		$arrParam = array();		
		$addField = "";
		$addValue = "";
	
		foreach($fld as $value)
		{  
				$addField .= ", {$value}";
				$addValue .= ", ?";
				$arrParam[] = $data[$value]; 
		} 
 
		$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";  
		$sql.="SELECT @@IDENTITY as id";
                $stmChkMaster = $db->QueryParam($sql, $arrParam);
                if ($stmChkMaster)
				{
					$next_result = $db->NextResult($stmChkMaster);
					if( $next_result ) {
						$ret= $db->Fetch($stmChkMaster); 
							//UPDATE'
							$ret_id = $_REQUEST['hdrID']; 
							$returnData = array("id"=>$ret_id);
						}
				} 
	break;
        case "EDIT" : 
		$arrParam = array();
		$upField = "";
		foreach($fld as $value)
		{ 
        
                        $a = str_replace(',', '', $data[$value]);
                        $upField .= ", {$value} = ?";
                        $arrParam[] = $a;  
        
		}
		$sql = "UPDATE {$table} 
					SET ".substr($upField, 1)."
				WHERE {$keyName} = ?";
 
		$arrParam[] = $data["id"];
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
		
	break;
	case "DISABLED" :  
		$sql = "Declare @idx as bigint;
				set @idx = ?; 
                update ar_so_dtl set i_enable=2 where ar_so_dtl_id =@idx;"; 
		$arrParam = array($data["id"]); 
           
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
	break;
	case "DELETE" :  
		$sql = "Declare @idx as bigint;
				set @idx = ?; 
				delete from ar_so_dtl where ar_so_dtl_id =@idx;"; 
		$arrParam = array($data["id"]); 
               
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
	break;
}
        
	if ($stmChkMaster && $stmt2)
	{
		$db->CommitTran();
		$re = array("reval"=>0,"success"=>"Success","msg"=>"บันทึกเรียร้อย","data"=>@$returnData,"log"=>@$msgWanning);
	}
	else
	{
		$db->RollBackTran();
		$re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
	}
	echo json_encode($re); exit;
        
?>
