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
$table 		= "ar_so_hdr";
$keyName 	= "ar_so_hdr_id";
 
$data = $util->mnUser($_REQUEST); 
$c_code_mu = "SO"; 
       
$fld = array("c_code"
            ,"dc_cnt_id"
            ,"dc_product_group_id"
            ,"dc_product_type_id"
            ,"dc_cost_id"
            ,"i_is_commit" 
            ,"cnt_emp_id"
            ,"dc_comm_id"
            ,"is_billing_cont" 
            ,"c_yyyy_mm"
            ,"c_billing_inv_des"
            ,"c_so_no"
            ,"c_po_no" 
            ,"d_so_date"
            ,"d_doc_date" 
            ,"f_advance_amt"
            ,"f_disc_com"
            ,"f_disc_cash"  
            ,"i_group_type"
            ,"i_class_type" 
            ,"i_is_status" 
            ,"i_is_sale_external" 
            ,"i_is_barter" 
            ,"f_total_cost"
            ,"f_net_cost"
            ,"onair_yyyy_mm" 
            ,"i_is_imc"
            ,"pj_hdr_id" 
			,"ar_package_id"
            ,"i_cont"
            ,"bh_contract_id"
            ,"c_comment"
            ,"i_enable"
            ,"i_delete"
            ,"dc_user_create_id"
            ,"dc_user_create_cost_id"
            ,"d_create"
            ,"dc_user_update_id"
            ,"dc_user_update_cost_id"
            ,"d_update");
        
//Inteliz
if($mode!='DELETE')
{
	$data['onair_yyyy_mm'] = $data['onair_yyyy'].sprintf('%02d', $data['onair_mm']); 

        
            if($data['order_type']=='i_is_barter'){
                 
                 $data['i_is_commit']   = 0;
                 $data['i_is_imc']      = 0;
                 $data['i_is_barter']   = 1;
                 $data['pj_hdr_id']     = 0; 
                 
            }else if($data['order_type']=='i_is_imc'){
                
                $data['i_is_imc']      = 1;
                $data['i_is_barter']   = 0;
                
            }else{
        
                $data['i_is_imc']       = 0;
                $data['i_is_barter']    = 0;
                $data['pj_hdr_id']      = 0; 
            }
	//Package			
	if(isset($data['ar_package_id']) && $data['ar_package_id']>0){       
		$data['ar_package_id'] 	= $data['ar_package_id']; 
	}else{
		$data['ar_package_id'] 	= 0;
	}     
	
	//Sum Dtl to hdr UPDATE
	if(isset($data['id']) && $data['id']>0){ 
		$f1	= $db->GetDataBySQL("select sum(f_total_cost) as f_total_cost
                                ,sum(f_total_cost-f_disc_com_amt) as f_net_cost  
                                from ar_so_dtl 
                                where isnull(i_delete,1)=2 
                                and isnull(i_enable,2)=1 
                          and ar_so_hdr_id=?",array($_REQUEST["id"]));
                
		$data['f_total_cost'] 	= 	$f1['f_total_cost'];
		$data['f_net_cost'] 	=	$f1['f_net_cost']; 
	}else{
		$data['f_total_cost'] 	= 	0;
		$data['f_net_cost'] 	=	0; 
	}//Sum Dtl to hdr
        
	$data['d_so_date']  = $date->bc_to_ad($data['d_so_date']);
        $data['d_doc_date'] = $date->bc_to_ad($data['d_doc_date']);
        $d_doc_date =  $pieces = explode("-", $data['d_doc_date']); //list c_yyyy_mm
        $data['c_yyyy_mm'] = $d_doc_date[0].$d_doc_date[1];  //
        
        
	$data['dc_comm_id'] = (isset($data['i_is_sale_external']))?$data['cnt_emp_id']:$data['dc_emp_id'];
        
	$data['dc_product_group_id']    = 0;
        $data['dc_product_type_id']     = 0;
        //dc_cost
        $data['dc_cost_id'] =(isset($data['dc_cost_id']) && $data['dc_cost_id']>0)?$data['dc_cost_id']:$_SESSION['dc_cost_id'];
                
        $data['i_class_type']           = 1;  // ประเภทใบสั่ง 1=TV, 2=Radio, 3=order 4=period, 5=revernew sharing 
        $data['f_advance_amt']          = 0;
        $data['f_disc_com']             = 0;
        $data['f_disc_cash']            = 0; 
        $data['i_is_status']            = 2; // สถานะ (0=แก้ไข, 1=ยกเลิก, 2=ปกติ)
        
        
        $data['i_enable']    = 1;
        $data['i_delete']    = 2;

        
        
        $data['is_billing_cont']    = 1;   //เป็น 0 เฉพาะออกบิลไม่มีออเดอร์
        $data['i_is_billing_only']  = 0;    // เป็น 1 เฉพาะออกบิลไม่มีออเดอร์
        
        if(isset($data['i_is_commit']) && $data['i_is_commit']==1){
            
            if($data['i_is_sale_external']==1){ 
                $data['dc_comm_id']         = $data['cnt_emp_id'];
            }else{
                $data['dc_comm_id']         = $data['dc_emp_id'];
            }
        }else{
                $data['cnt_emp_id']         = null; 
                $data['i_is_sale_external'] = null;
                $data['dc_comm_id']         = null;
                $data['i_is_commit']        =   0;
        
        }
        if(isset($data['i_cont'])){
        
        }else{
            $data['i_cont']         = 0; 
            $data['bh_contract_id'] = 0; 
        }
        
}	
//print_r($data); 
//exit; 

$db->BeginTran();
$stmChkMaster 	= true; // as so 
$stmChkDelDtl 	= true; // as dtl

function checkListData($id)
{
     global $db,$date,$_REQUEST;  
            $ret_id         = $id;  
            $stmChkDelDtl   = true; 
            $chek           = (isset($_REQUEST['removeDtl']))?$_REQUEST['removeDtl']:'';
            
            if($chek=='CHGHEADER')
            {
                $sqlDelDtl = "Declare @hdrID as bigint;
                                 set @hdrID = ?;
                                 delete from ar_so_dtl where ar_so_hdr_id =@hdrID;  
                             ";  
                
                $arrParamDelDtl = array($ret_id);  
                $stmChkDelDtl   = $db->QueryParam($sqlDelDtl, $arrParamDelDtl);
                $msgWanning     = "Yes Dtl removeDtl = {$chek}"; 
            }else{
                $msgWanning     = "NO Dtl removeDtl = "; 
            } 
 //get to list 
            $row = $db->GetDataBySQL("select * from ar_so_hdr where ar_so_hdr_id=?", array($ret_id));
            $f_pj_amt    = 0;
            $f_dtl_amt   = 0; 
           if($row["i_is_imc"]==0 && $row["i_is_barter"]==0){
                  $order_type = '-1'; 
           }else if($row["i_is_imc"]==1 && $row["i_is_barter"]==0){
                  $order_type = "i_is_imc";  
           }else if($row["i_is_imc"]==0 && $row["i_is_barter"]==1){
                  $order_type = "i_is_barter";  
           } 
            $f_pj_amt = $db->GetDataBySQL("select isnull(f_tv_amt,0) from pj_hdr where pj_hdr_id=?", array($row['pj_hdr_id']));
            $f_dtl_amt = $db->GetDataBySQL("select sum(isnull(f_net_cost,0)) from ar_so_dtl where ar_so_hdr_id=?", array($row['ar_so_hdr_id']));
          
           return array("stm" =>$stmChkDelDtl,
                        "data" => array(
                            "id"            =>$row['ar_so_hdr_id'],
                            "f_pj_amt"      => floatval($f_pj_amt),
                            "f_dtl_amt"     => floatval($f_dtl_amt), 
                            "order_type"    =>$order_type,
                            "i_group_type"  =>$row['i_group_type'],
                            "onair_yyyy_mm" =>$row["onair_yyyy_mm"]?(@$date->l_month_thai[substr($row["onair_yyyy_mm"],4,2)]." ".(floatval(substr($row["onair_yyyy_mm"],0,4))+543)):null,
                        ),
                        "log" =>@$msgWanning,
                );           
} //End Function 
  
switch ($mode) { 
	case "GENCODE" : 
                        
    $row        = $db->GetDataBySQL("select * from ar_so_hdr where ar_so_hdr_id = ?",array($_REQUEST['id']));
    $f_pj_amt   = $db->GetDataBySQL("select isnull(f_tv_amt,0) from pj_hdr where isnull(i_enable,2) = 1 and pj_hdr_id=?", array($row['pj_hdr_id']));
    $f1  = $db->GetDataBySQL("select count(ar_so_dtl_id) as ct, isnull(sum(f_total_cost),0) as f_total_cost , isnull(sum(f_net_cost),0) as f_net_cost 
                    from ar_so_dtl 
                    where isnull(i_enable,2) = 1 and ar_so_hdr_id=?", array($row['ar_so_hdr_id']));
        
   $check = 0;
   if($row['i_is_imc']==1){ 
     $check = ($f_pj_amt<$f1['f_net_cost'])?1:0; //money imc < so dtl
     $msg = 'กรุณาแก้ไขรายละเอียด '.number_format($f1['f_net_cost'],2).' มีมากกว่าเงินในโครงการ IMC '.number_format($f_pj_amt,2);
   }
   
   if($f1['ct']==0){
     $check = 1; //No so dtl
     $msg   = 'กรุณาแก้ไขรายละเอียด'; 
   }  
 //echo $row['ar_so_hdr_id']."{$msg}".$f1['f_total_cost']; exit;     
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
            ,f_total_cost=?
            ,f_net_cost=?
            ,dc_user_update_id =?
            ,dc_user_update_cost_id =?
            ,d_update =?
            WHERE {$keyName} = ?"; 
            $arrParam2= array($c_code
                    , $f1['f_total_cost']
                    , $f1['f_net_cost']
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
    }
        $returnData     = @$ret['data'];  
        $stmChkDelDtl   = @$ret['stm']; 
        $log            = @$ret['log'];
			
                        
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
                                
                                $ret            = @checkListData($ret_id);
                                $returnData     = @$ret['data']; 
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
                                
                       }else if($value=='cnt_emp_id' || $value=='i_is_sale_external' || $value=='dc_comm_id'){
                                $upField .= ", {$value} = ?";
				$arrParam[] = null;
        
                       }else if($value=='i_is_imc' 
                               || $value=='i_is_barter' 
                               || $value=='i_is_commit' 
                               || $value=='bh_contract_id' 
                               || $value=='i_cont' 
                               || $value=='cnt_emp_id' 
							   || $value=='ar_package_id'
                               || $value=='pj_hdr_id'){
                                $upField .= ", {$value} = ?";
				$arrParam[] = 0;
                       } 
		}
		$sql = "UPDATE {$table} SET ".substr($upField, 1)." WHERE {$keyName} = ?"; 
		$arrParam[] = $data["id"];
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
//chgHeader 
        $ret            = @checkListData($data['id']);
        $returnData     = @$ret['data'];  
        $stmChkDelDtl   = @$ret['stm']; 
        $log            = @$ret['log'];
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
        
	if ($stmChkDelDtl && $stmChkMaster)
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
