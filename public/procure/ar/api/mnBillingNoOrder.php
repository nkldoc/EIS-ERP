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
$table 		= "ar_bill_invoice_hdr";
$keyName 	= "ar_bill_invoice_hdr_id";
        
 
$data = $util->mnUser($_REQUEST); 
$c_code_mu = "AR"; 
$msg = "บันทึกเรียร้อย";       
    
$fld = array("i_is_imc"
            ,"i_is_barter"
            ,"c_contract_no"
            ,"d_contract_date"
            ,"dc_cnt_id"
            ,"dc_product_group_id"
            ,"dc_product_type_id"
            ,"onair_yyyy_mm"
            ,"dc_cost_id"
            ,"pj_hdr_id"
            ,"d_so_date"
            ,"d_doc_date" 
            ,"i_so_type"
            ,"i_type_region"
            ,"i_group_type"
            ,"i_class_type"
            ,"i_no_order"
            ,"i_enable"
            ,"dc_user_create_id"
            ,"dc_user_create_cost_id"
            ,"d_create"
            ,"dc_user_update_id"
            ,"dc_user_update_cost_id"
            ,"d_update");


$fld1 = array("dc_cnt_id"
            ,"ar_so_hdr_id" 
            ,"dc_product_type_id"
            ,"dc_tax_id_tax"
            ,"tax_rate"
            ,"c_yyyy_mm"
            ,"dc_tax_id_vat"
            ,"vat_rate" 
            ,"c_inv_old"
            ,"c_comment"
            ,"dc_ar_adjust_id"
            ,"i_is_show_txt_dtl" 
            ,"dc_area_id"
            ,"d_billing_date"
            ,"d_end_pay" 
            ,"i_is_billing"
            ,"i_is_invoice" 
            ,"c_billing_name" 
    ,"d_doc_date" 
    ,"c_billing_addr" 
            ,"i_is_show_disc_cash"
            ,"i_no_order"
            ,"i_is_tv" 
            ,"i_class_type"
            ,"i_type_region" 
            ,"i_enable"
            ,"dc_user_create_id"
            ,"dc_user_create_cost_id"
            ,"d_create"
            ,"dc_user_update_id"
            ,"dc_user_update_cost_id"
            ,"d_update");

if($mode=="sumDtl"){
        $_REQUEST['id'] = $_REQUEST['ar_bill_invoice_hdr_id'];
        $data['id']     = $_REQUEST['id'];
        
        $f1 = $db->GetDataBySQL("select 
			(select top 1 dc_cost_id from ar_so_hdr where ar_so_hdr_id=ar_bill_invoice_hdr.ar_so_hdr_id) as dc_cost_id 
			,right(c_yyyy_mm,4) as yymm
			,*
                        ,isnull(c_code,'0') as c_code
			from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?",array($_REQUEST['id']));
	
    $f2= $db->GetDataBySQL("select top 1 
			(select top 1 f_tax_rate from dc_tax where dc_tax_id=ar_bill_invoice_dtl.dc_wht_tax_id) as f_tax_rate
				,(select top 1 dc_product_type_id from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=ar_bill_invoice_dtl.ar_bill_invoice_hdr_id) as dc_product_type_id 
				, sum(isnull(f_total_cost,0)) as f_total_cost
				, sum(isnull(f_disc_com,0)) as f_disc_com
				, sum(isnull(f_disc_cash,0)) as f_disc_cash
				, sum(isnull(f_net_cost,0)) as f_net_cost
				, sum(isnull(f_net_disc_comm_amt,0)) as f_net_disc_comm_amt
				, sum(isnull(f_new_net_cost,0)) as f_new_net_cost 
				, sum(isnull(f_wht_amt,0)) as f_wht_amt
				, sum(isnull(f_req_amt,0)) as f_req_amt
				, dc_wht_tax_id 
			from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id = ?
			group by ar_bill_invoice_hdr_id,dc_wht_tax_id 
			",array($data['id']));    
    // tax 
        $data["dc_tax_id_tax"]	= $f2["dc_wht_tax_id"];   
	$data["tax_rate"]      	= $f2["f_tax_rate"];  
	$data["f_tax_amt"]      = $data["f_wht_amt"]; 
 
	$data["c_class"] 	= $db->GetDataBySQL("select (select top 1 c_ref_doc from dc_product_class where dc_product_class_id=dc_product_type.dc_product_class_id) as c_ref_doc from dc_product_type where dc_product_type_id = ?",array($f2["dc_product_type_id"]));
	$data["yymm"]           = $f1["yymm"]; 
	$data["dc_cost_id"]     = $f1["dc_cost_id"]; 
	 
        $ret_id 	= $_REQUEST["id"];  
        
if($f1['c_code']=='0')
{
        $code_dc 	= (string)"AR";
		//code
        $arrParam  	= array($code_dc,$f1['c_yyyy_mm'],$data['dc_user_update_id'],$data['dc_user_update_cost_id'],$ret_id);  
        $sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;"; 
        $stmt           = $db->QueryParam($sql,$arrParam);  
        $arr_gen_code   = $db->Fetch($stmt); 
        $c_code 	= $arr_gen_code["c_code_gen"];
        $ref_id   	= $arr_gen_code["reference_id"]; 
    
        $arrParam  	= array($code_dc,$f1['c_yyyy_mm'],$data['dc_user_update_id'],$data['dc_user_update_cost_id'],$ret_id,$f1["dc_cost_id"]); 
        $sql		= "EXEC SP_GEN_CODE_AREA ?,?,?,?,?,?;"; 
        $stmt           = $db->QueryParam($sql,$arrParam); 
        $arr_gen_code   = $db->Fetch($stmt);
		
        $c_code1 	= $arr_gen_code["c_code_gen_area"];
        $ref_id1   	= $arr_gen_code["reference_id"]; 
		
  
        if ($ret_id==$ref_id && $ret_id==$ref_id1)
        {
            $sql2 = "UPDATE {$table}
            SET c_code		= ?
			, c_area_code	= ?
			, c_area_print	= ? 
			, f_tax_amt		= ? 
			, dc_tax_id_tax = ?
			, tax_rate		= ?   
			, f_vat_amt		= ? 
			, f_total_cost_amt		= ?
			, f_disc_com_amt		= ?
			, f_disc_cash_amt 		= ?
			, f_net_cost_amt 		= ?
			, f_new_net_cost 		= ?
			, f_req_amt 			= ?
			, f_net_disc_comm_amt	= ? 
                        , f_net_cost_add_vat_amt = ?
                        
            , dc_user_update_id =?
            , dc_user_update_cost_id =?
            , d_update =?
            WHERE {$keyName} = ?"; 
            $arrParam2 = array($c_code
                                , $c_code1
                                ,'0'
                                , $mon->parseFloat($data['f_tax_amt'])
                                , $data['dc_tax_id_tax']
                                , $mon->parseFloat($data['tax_rate'])
                                , $mon->parseFloat($data['f_vat_amt'])	/*, $data['dc_tax_id_vat'], $data['vat_rate']*/ 
                                , $mon->parseFloat($data['f_total_cost_amt']) 
                                , $f2['f_disc_com']
                                , $f2['f_disc_cash']
                                , $mon->parseFloat($data['f_net_cost_amt'])
                                , $f2['f_new_net_cost']
                                , $f2['f_req_amt']
                                , $f2['f_net_disc_comm_amt']
                                ,($f2['f_net_disc_comm_amt']+floatval($mon->parseFloat($data['f_vat_amt'])))
                                , $_SESSION["user_id"]
                                , $_SESSION["dc_cost_id"]
                                , date("Y-m-d H:i:s")
                                , $ret_id); 
            $stmt2 = $db->QueryParam($sql2,$arrParam2);
        }
 }else{
            $sql2 = "UPDATE {$table}
            SET f_tax_amt		= ? 
			, dc_tax_id_tax = ?
			, tax_rate		= ?   
			, f_vat_amt		= ? 
			, f_total_cost_amt		= ?
			, f_disc_com_amt		= ?
			, f_disc_cash_amt 		= ?
			, f_net_cost_amt 		= ?
			, f_new_net_cost 		= ?
			, f_req_amt 			= ?
			, f_net_disc_comm_amt	= ? 
                        , f_net_cost_add_vat_amt = ?
                        
            , dc_user_update_id =?
            , dc_user_update_cost_id =?
            , d_update =?
            WHERE {$keyName} = ?"; 
            $arrParam2 = array( $mon->parseFloat($data['f_tax_amt'])
                                , $data['dc_tax_id_tax']
                                , $mon->parseFloat($data['tax_rate'])
                                , $mon->parseFloat($data['f_vat_amt'])	/*, $data['dc_tax_id_vat'], $data['vat_rate']*/ 
                                , $mon->parseFloat($data['f_total_cost_amt']) 
                                , $f2['f_disc_com']
                                , $f2['f_disc_cash']
                                , $mon->parseFloat($data['f_net_cost_amt'])
                                , $f2['f_new_net_cost']
                                , $f2['f_req_amt']
                                , $f2['f_net_disc_comm_amt']
                                ,($f2['f_net_disc_comm_amt']+floatval($mon->parseFloat($data['f_vat_amt'])))
                                , $_SESSION["user_id"]
                                , $_SESSION["dc_cost_id"]
                                , date("Y-m-d H:i:s")
                                , $ret_id);
 				
            $stmt2 = $db->QueryParam($sql2,$arrParam2);
 }              
             if ($stmt2)
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
  exit();      
//GENCODE
        
} else if($mode=="ADD" || $mode=="EDIT"){
    
$pt         = $db->GetDataBySQL("select * from dc_product_type where dc_product_type_id=?", array($data['dc_product_type_id']));
$dc_tax_id  = $db->GetDataBySQL("select dc_tax_id from dc_tax_def where dc_product_class_id=?", array($pt['dc_product_class_id']));
$tax        = $db->GetDataBySQL("select * from dc_tax where dc_tax_id=?", array($dc_tax_id));
$vat        = $db->GetDataBySQL("select * from dc_vat where dc_vat_id=?", array($data["dc_vat_id"]));
    $area                       = $db->GetDataBySQL("select * from dc_cost where dc_cost_id=?", array($data['dc_cost_id']));
    $data["dc_area_id"]         = $area["dc_area_id"];
    $cnt                        = $db->GetDataBySQL("select * from dc_cnt where dc_cnt_id=?", array($data['dc_cnt_id']));
    $data["c_billing_name"]     = $cnt["c_name_inv"];    
    $data["c_billing_addr"]     = $cnt["c_address_inv"];
    $data["i_is_invoice"]       = 1; 
    
        
    $data["dc_tax_id_tax"]  = $tax["dc_tax_id"];
    $data["tax_rate"]       = $tax["f_tax_rate"];
    $data["dc_tax_id_vat"]  = $vat["dc_vat_id"];
    $data["vat_rate"]	= $vat["f_vat_rate"];

    if($data["order_type"] =="i_is_imc"){
        $data["i_is_barter"]= 0;
        $data["i_is_imc"]   = 1;
    }else if($data["order_type"] =="i_is_barter"){
        $data["i_is_barter"]= 1;
        $data["i_is_imc"]   = 0;
        $data["pj_hdr_id"]  = 0;  
    }else{
        $data["i_is_barter"]= 0;
        $data["i_is_imc"]   = 0;
        $data["pj_hdr_id"]  = 0;     
    }

    $data["dc_ar_adjust_id"]	=  1; //สถานะลูกหนี้

    $data["onair_yyyy_mm"]          = sprintf("%04d%02d",$data['onair_yyyy'],$data['onair_mm']); 



    $data["d_contract_date"]        = ($data["c_contract_no"]=="")?"":$date->bc_to_ad($data["d_contract_date"]);  
    $data["d_billing_date"]         = $date->bc_to_ad($data["d_billing_date"]);
    $data["d_end_pay"]              = $date->bc_to_ad($data["d_end_pay"]);

    $data["d_so_date"]              = $date->bc_to_ad($data["d_doc_date"]);  
    $data["d_doc_date"]             = $date->bc_to_ad($data["d_doc_date"]);

    $data["i_so_type"]              = ($pt["region_type"]==2)?$pt["region_type"] : 1;
    $data["i_type_region"]          = 1;
    $data["i_enable"]               = ($mode=="EDIT")?"":1;
    $data["i_is_show_txt_dtl"]      = 0;
    $data["dc_product_group_id"]    = $pt["dc_product_group_id"];
    $data["i_group_type"]           = $pt["i_group_type"];
    $data["i_class_type"]           = $pt["i_class_type"];
    $data["i_is_tv"]                = $pt["i_class_type"];
    $data["i_no_order"]             = 1; //ใช้กับวางบิลไม่มีออเดอร์

    $dd                             = explode("-",$data["d_billing_date"]);
    $data["c_yyyy_mm"]              = $dd[0].$dd[1];

} // ADD OR EDIT


//echo ($_REQUEST['d_doc_date']);
//echo ($data['d_doc_date']); exit;

$db->BeginTran();
$stmChkMaster 	= true; // as so 
$stmChkDelDtl 	= true; // as dtl 
//print_r($data);
//exit;
switch ($mode) { 
	case "ADD" : AddSo('ar_so_hdr'); break;
        case "EDIT" : EditSo('ar_so_hdr'); break;
};
exit; 
function addDtl($table="")
{
 global $db,$data,$date,$mode;  
        
        $fld = array("ar_bill_invoice_hdr_id" 
                        ,"ar_so_dtl_id" 
                        ,"dc_wht_tax_id"
                        ,"f_total_cost" 
                        ,"f_disc_com"
                        ,"f_disc_cash"
                        ,"f_net_disc_comm_amt"
                        ,"f_net_cost"
                        ,"f_wht_amt"
                        ,"f_left_cost" 
                        ,"c_comment" 
                        ,"dc_user_create_id"
                        ,"dc_user_create_cost_id"
                        ,"d_create"
                        ,"dc_user_update_id"
                        ,"dc_user_update_cost_id"
                        ,"d_update");      
        
            $AR_WHT = $db->GetDataBySQL("select top 1 a.dc_tax_id from dc_tax_def a
                inner join ar_so_dtl d on a.dc_product_class_id = (select dc_product_class_id from dc_product_group 
                where dc_product_group_id in(select top 1 dc_product_group_id from dc_product_type where dc_product_type_id =?)
            )", array($data['dc_product_type_id']));
 
        foreach($data['soDtl'] as $so_dtl_id){

                //Intelize
                $f1         = $db->GetDataBySQL("select * from ar_so_dtl where ar_so_dtl_id=?",array($so_dtl_id));
                $f_tax_rate = $db->GetDataBySQL("select f_tax_rate from dc_tax where dc_tax_id=?",array($AR_WHT)); 

                $data['f_total_cost']           = $f1["f_total_cost"];
                $data['f_disc_com']             = $f1["f_disc_com"];
                $data['f_disc_cash']            = $f1["f_disc_cash"];
                $data['f_left_cost']            = $f1["f_total_cost"];   
                $data['f_net_disc_comm_amt']    = $f1["f_total_cost"]-$f1["f_disc_com"];
                $data['f_net_cost']             = $f1["f_net_cost"]; 
                //Syncro
                $data['ar_so_dtl_id']           = $so_dtl_id; 
                //setValue 
                $data['dc_wht_tax_id']          = $AR_WHT;           //define("AR_WHT",  7); id ภาษีหัก ณ. ที่จ่าย แทนตัวเก่า   
                $data['f_wht_amt']              = $mon->round54(($f1['f_net_cost']*$f_tax_rate/100),2);
                $data['c_comment']              = isset($data["comment{$so_dtl_id}"])?$data["comment{$so_dtl_id}"]:null;

       //info     
                $data['dc_user_create_id']      = $_SESSION["user_id"];
                $data['dc_user_create_cost_id'] = $_SESSION["dc_cost_id"];
                $data['d_create']               = date("Y-m-d H:i:s");

                $data['dc_user_update_id']      = $_SESSION["user_id"];
                $data['dc_user_update_cost_id'] = $_SESSION["dc_cost_id"];
                $data['d_update']               = date("Y-m-d H:i:s");
                
        
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
                                $db->CommitTran();
                                $re = array("reval"=>0,"success"=>"Success","msg"=>"บันทึกเรียร้อย","data"=>@$returnData,"log"=>@$msgWanning);
                        }
                        else
                        {
                                $db->RollBackTran();
                                $re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
                        }
                        echo json_encode($re); exit;
        
        }//End LoOp
}

function EditSo($table="")
{
 global $db,$data,$date,$fld,$fld1;  
                //$table    = $table;
   		$arrParam = array();		
		$upField = ""; 
		foreach($fld as $value)
		{  
			if(!empty($data[$value]))
			{ 
        
                                $upField .= ", {$value} = ?";
				$arrParam[] = $data[$value]; 
                                
                        }else if($value=='i_is_barter' //save empty or 0
                                || $value=='i_is_imc' 
                                || $value=='pj_hdr_id'
                                ){
                            
                                $upField .= ", {$value} = ?";
				$arrParam[] = 0;       
                        } 
		}  
                $sql = "UPDATE {$table} SET ".substr($upField, 1)." WHERE ar_so_hdr_id = ?"; 
		$arrParam[] = $data["ar_so_hdr_id"];
//        echo $sql; print_r($arrParam); exit;
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
                $rss = EditBill('ar_bill_invoice_hdr'); 
        
}

function EditBill($table="")
{
 global $db,$data,$date,$fld,$fld1;   
   		$arrParam = array();		
		$upField = ""; 
		foreach($fld1 as $value)
		{  
			if(!empty($data[$value]))
			{ 
				$upField .= ", {$value} = ?";
				$arrParam[] = $data[$value]; 
                        }else if($value=='i_is_show_txt_dtl' //save empty or 0
                                || $value=='i_is_disc_cash' 
                                || $value=='i_is_show_disc_cash'
                                ){
                                $upField .= ", {$value} = ?";
				$arrParam[] = 0;      
                        } 
		}  
        
                $sql            = "UPDATE {$table} SET ".substr($upField, 1)." WHERE ar_bill_invoice_hdr_id = ?"; 
		$arrParam[]     = $data["id"];
//                echo $sql; print_r($arrParam); exit;
                $chek           = (isset($_REQUEST['removeDtl']))?$_REQUEST['removeDtl']:''; 
                if($chek=='CHGHEADER')
                {
                    $sqlDelDtl = "Declare @hdrID as bigint;
                                     set @hdrID = ?;
                                     delete from ar_so_dtl where ar_so_hdr_id =@hdrID;  
                                 ";
                    $arrParamDelDtl = array($data["ar_so_hdr_id"]);  
                    $stmChkDelDtl   = $db->QueryParam($sqlDelDtl, $arrParamDelDtl);
                    $msgWanning     = "Yes Dtl removeDtl = {$chek}"; 
                }else{
                    $msgWanning     = "NO Dtl removeDtl = "; 
                } 
                
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
                            $returnData = array(
                                "ar_so_hdr_id"          => $data["ar_so_hdr_id"],
                                "ar_bill_hdr_id"        => $data["id"],
                                "dc_product_type_id"    => $data["dc_product_type_id"],
                                "order_type"            => $data["order_type"]
                            );
                            $msg = "บันทึกเรียบร้อย";
                            if ($stmChkMaster)
                            {
                                    $db->CommitTran(); 
                                    $re = array("reval"=>0,"success"=>"Success","msg"=>$msg,"data"=>$returnData,"log"=>@$msgWanning);
                            }
                            else
                            {
                                    $db->RollBackTran();
                                    $re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
                            }
                            echo json_encode($re); exit; 
        
    
}


function AddSo($table="")
{
 global $db,$data,$date,$fld,$fld1;  
                //$table    = $table;
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
                        }else if($value=='i_is_barter' //save empty or 0
                                || $value=='i_is_imc' 
                                || $value=='pj_hdr_id'
                                ){
                                $addField .= ", {$value}";
				$addValue .= ", ?";
				$arrParam[] = 0;        
                        } 
		}  
		$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";  
		$sql.="SELECT @@IDENTITY as id"; 
//    echo $sql;
//    print_r($arrParam); exit;
		$stmChkMaster = $db->QueryParam($sql, $arrParam); 
		if ($stmChkMaster)
		{
                    $next_result = $db->NextResult($stmChkMaster);
                    if( $next_result ) {
                            $ff     = $db->Fetch($stmChkMaster); 
                            $data["ar_so_hdr_id"] = $ff["id"]; 
                            //echo " ar_so_hdr_id == {$data["ar_so_hdr_id"]} <br/>"; exit;
                            $rss= AddBill('ar_bill_invoice_hdr'); 
                            
                    }
                } 
}

function AddBill($table="")
{
 global $db,$data,$date,$fld,$fld1;   
   		$arrParam = array();		
		$addField = "";
		$addValue = ""; 
		foreach($fld1 as $value)
		{  
			if(!empty($data[$value]))
			{ 
				$addField .= ", {$value}";
				$addValue .= ", ?";
				$arrParam[] = $data[$value];
                        }else if($value=='i_is_show_txt_dtl' //save empty or 0
                                || $value=='i_is_disc_cash' 
                                || $value=='i_is_show_disc_cash'
                                ){
                                $addField .= ", {$value}";
				$addValue .= ", ?";
				$arrParam[] = 0;        
                        } 
		}  
		$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";  
		$sql.="SELECT @@IDENTITY as id"; 
                
		$stmChkMaster = $db->QueryParam($sql, $arrParam); 
//    echo $sql;
//    print_r($arrParam); exit;
		if ($stmChkMaster)
		{
                    $next_result = $db->NextResult($stmChkMaster);
                    if( $next_result ) {
                            $ff                                 = $db->Fetch($stmChkMaster); 
                            $data["ar_bill_invoice_hdr_id"]     = $ff["id"]; 
    
                            $returnData = array(
                                "ar_so_hdr_id"              => $data["ar_so_hdr_id"],
                                "ar_bill_invoice_hdr_id"    => $data["ar_bill_invoice_hdr_id"],
                                "dc_product_type_id"        => $data["dc_product_type_id"],
                                "order_type"                => $data["order_type"]
                            );
                            $msg = "บันทึกเรียบร้อย";
                            if ($stmChkMaster)
                            {
                                    $db->CommitTran(); 
                                    $re = array("reval"=>0,"success"=>"Success","msg"=>$msg,"data"=>$returnData);
                            }
                            else
                            {
                                    $db->RollBackTran();
                                    $re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
                            }
                            echo json_encode($re); exit; 
                    }
                }
    
}
        
switch ($mode) { 
	
    case "GENCODE2" :    
	
	$ret_id 	= $_REQUEST["id"];  	
    $f1 = $db->GetDataBySQL("select 
			(select top 1 dc_cost_id from ar_so_hdr where ar_so_hdr_id=ar_bill_invoice_hdr.ar_so_hdr_id) as dc_cost_id 
			,right(c_yyyy_mm,4) as yymm
			,* 
			from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?",array($_REQUEST['id']));
	
    $f2= $db->GetDataBySQL("select top 1 
			(select top 1 f_tax_rate from dc_tax where dc_tax_id=ar_bill_invoice_dtl.dc_wht_tax_id) as f_tax_rate
				,(select top 1 dc_product_type_id from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=ar_bill_invoice_dtl.ar_bill_invoice_hdr_id) as dc_product_type_id 
				, sum(isnull(f_total_cost,0)) as f_total_cost
				, sum(isnull(f_disc_com,0)) as f_disc_com
				, sum(isnull(f_disc_cash,0)) as f_disc_cash
				, sum(isnull(f_net_cost,0)) as f_net_cost
				, sum(isnull(f_net_disc_comm_amt,0)) as f_net_disc_comm_amt
				, sum(isnull(f_new_net_cost,0)) as f_new_net_cost 
				, sum(isnull(f_wht_amt,0)) as f_wht_amt
				, sum(isnull(f_req_amt,0)) as f_req_amt
				, dc_wht_tax_id 
			from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id = ?
			group by ar_bill_invoice_hdr_id,dc_wht_tax_id 
			",array($data['id']));    
        // tax 
        $data["dc_tax_id_tax"]	= $f2["dc_wht_tax_id"];   
	$data["tax_rate"]      	= $f2["f_tax_rate"];  
	$data["f_tax_amt"]      = $data["f_wht_amt"]; 
 
	 
            $sql2 = "UPDATE {$table}
            SET c_area_print	= ? 
			, f_tax_amt		= ? 
			, dc_tax_id_tax = ?
			, tax_rate		= ?   
			, f_vat_amt		= ? 
			, f_total_cost_amt		= ?
			, f_disc_com_amt		= ?
			, f_disc_cash_amt 		= ?
			, f_net_cost_amt 		= ?
			, f_new_net_cost 		= ?
			, f_req_amt 			= ?
			, f_net_disc_comm_amt	= ? 
            , dc_user_update_id =?
            , dc_user_update_cost_id =?
            , d_update =?
            WHERE {$keyName} = ?"; 
            $arrParam2 = array('0'
                        , $mon->parseFloat($data['f_tax_amt'])
                        , $data['dc_tax_id_tax']
                        , $mon->parseFloat($data['tax_rate'])
                        , $mon->parseFloat($data['f_vat_amt'])	/*, $data['dc_tax_id_vat'], $data['vat_rate']*/ 
                        , $mon->parseFloat($data['f_total_cost_amt']) 
                        , $f2['f_disc_com']
                        , $f2['f_disc_cash']
                        , $mon->parseFloat($data['f_net_cost_amt'])
                        , $f2['f_new_net_cost']
                        , $f2['f_req_amt']
                        , $f2['f_net_disc_comm_amt']
                        , $_SESSION["user_id"]
                        , $_SESSION["dc_cost_id"]
                        , date("Y-m-d H:i:s")
                        , $ret_id);
 				
            $stmt2 = $db->QueryParam($sql2,$arrParam2);

     
           $msg = ''; 
           $ret = array("stm" =>$stmt2
                    ,"log"  => ""
                    ,"data" => array("c_code" =>'บันทึกรายการเรียบร้อย', "msg" =>$msg)
               );   
    
        $returnData     = @$ret['data'];  
        $stmChkDelDtl   = @$ret['stm']; 
        $log            = @$ret['log'];                
	break;
   case "GENCODE" :                 
    $f1 = $db->GetDataBySQL("select 
			(select top 1 dc_cost_id from ar_so_hdr where ar_so_hdr_id=ar_bill_invoice_hdr.ar_so_hdr_id) as dc_cost_id 
			,right(c_yyyy_mm,4) as yymm
			,* 
			from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?",array($_REQUEST['id']));
	
    $f2= $db->GetDataBySQL("select top 1 
			(select top 1 f_tax_rate from dc_tax where dc_tax_id=ar_bill_invoice_dtl.dc_wht_tax_id) as f_tax_rate
				,(select top 1 dc_product_type_id from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=ar_bill_invoice_dtl.ar_bill_invoice_hdr_id) as dc_product_type_id 
				, sum(isnull(f_total_cost,0)) as f_total_cost
				, sum(isnull(f_disc_com,0)) as f_disc_com
				, sum(isnull(f_disc_cash,0)) as f_disc_cash
				, sum(isnull(f_net_cost,0)) as f_net_cost
				, sum(isnull(f_net_disc_comm_amt,0)) as f_net_disc_comm_amt
				, sum(isnull(f_new_net_cost,0)) as f_new_net_cost 
				, sum(isnull(f_wht_amt,0)) as f_wht_amt
				, sum(isnull(f_req_amt,0)) as f_req_amt
				, dc_wht_tax_id 
			from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id = ?
			group by ar_bill_invoice_hdr_id,dc_wht_tax_id 
			",array($data['id']));    
    // tax 
        $data["dc_tax_id_tax"]	= $f2["dc_wht_tax_id"];   
	$data["tax_rate"]      	= $f2["f_tax_rate"];  
	$data["f_tax_amt"]      = $data["f_wht_amt"]; 
 
	$data["c_class"] 	= $db->GetDataBySQL("select (select top 1 c_ref_doc from dc_product_class where dc_product_class_id=dc_product_type.dc_product_class_id) as c_ref_doc from dc_product_type where dc_product_type_id = ?",array($f2["dc_product_type_id"]));
	$data["yymm"]           = $f1["yymm"]; 
	$data["dc_cost_id"]     = $f1["dc_cost_id"]; 
	 
        $ret_id 	= $_REQUEST["id"];   
        $code_dc 	= (string)"AR";
		//code
        $arrParam  		= array($code_dc,$f1['c_yyyy_mm'],$data['dc_user_update_id'],$data['dc_user_update_cost_id'],$ret_id); 
        $sql			= "EXEC SP_GEN_CODE ?,?,?,?,?;"; 
        $stmt           = $db->QueryParam($sql,$arrParam); 
        $arr_gen_code   = $db->Fetch($stmt);
		
        $c_code 	= $arr_gen_code["c_code_gen"];
        $ref_id   	= $arr_gen_code["reference_id"]; 
    
        $arrParam  		= array($code_dc,$f1['c_yyyy_mm'],$data['dc_user_update_id'],$data['dc_user_update_cost_id'],$ret_id,$data["dc_cost_id"]); 
        $sql			= "EXEC SP_GEN_CODE_AREA ?,?,?,?,?,?;"; 
        $stmt           = $db->QueryParam($sql,$arrParam); 
        $arr_gen_code   = $db->Fetch($stmt);
		
        $c_code1 	= $arr_gen_code["c_code_gen_area"];
        $ref_id1   	= $arr_gen_code["reference_id"]; 
		
  
        if ($ret_id==$ref_id && $ret_id==$ref_id1)
        {
            $sql2 = "UPDATE {$table}
            SET c_code		= ?
			, c_area_code	= ?
			, c_area_print	= ? 
			, f_tax_amt		= ? 
			, dc_tax_id_tax = ?
			, tax_rate		= ?   
			, f_vat_amt		= ? 
			, f_total_cost_amt		= ?
			, f_disc_com_amt		= ?
			, f_disc_cash_amt 		= ?
			, f_net_cost_amt 		= ?
			, f_new_net_cost 		= ?
			, f_req_amt 			= ?
			, f_net_disc_comm_amt	= ? 
            , dc_user_update_id =?
            , dc_user_update_cost_id =?
            , d_update =?
            WHERE {$keyName} = ?"; 
            $arrParam2 = array($c_code
						, $c_code1
						,'0'
						, $mon->parseFloat($data['f_tax_amt'])
						, $data['dc_tax_id_tax']
						, $mon->parseFloat($data['tax_rate'])
						, $mon->parseFloat($data['f_vat_amt'])	/*, $data['dc_tax_id_vat'], $data['vat_rate']*/ 
						, $mon->parseFloat($data['f_total_cost_amt']) 
						, $f2['f_disc_com']
						, $f2['f_disc_cash']
						, $mon->parseFloat($data['f_net_cost_amt'])
						, $f2['f_new_net_cost']
						, $f2['f_req_amt']
						, $f2['f_net_disc_comm_amt']
						, $_SESSION["user_id"]
						, $_SESSION["dc_cost_id"]
						, date("Y-m-d H:i:s")
						, $ret_id);
 				
            $stmt2 = $db->QueryParam($sql2,$arrParam2);

        }
           $msg = ''; 
           $ret = array("stm" =>$stmt2
                    ,"log"  => ""
                    ,"data" => array("c_code" =>$c_code, "msg" =>$msg)
               );   
    
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
                        }else if($value=='i_is_show_disc_cash' //save empty or 0
                                || $value=='i_is_show_txt_dtl' 
                                || $value=='pj_hdr_id'
                                || $value=='i_parent'
                                || $value=='i_is_invoice'
                                ){
                                $addField .= ", {$value}";
				$addValue .= ", ?";
				$arrParam[] = 0;        
                        } 
		}  
		$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";  
		$sql.="SELECT @@IDENTITY as id"; 
//         echo $sql."<br/>";
//         print_r($arrParam);exit;
		$stmChkMaster = $db->QueryParam($sql, $arrParam); 
		if ($stmChkMaster)
		{
			$next_result = $db->NextResult($stmChkMaster);
			if( $next_result ) {
				$ff = $db->Fetch($stmChkMaster);
                                
				$ret_id         = $ff["id"]; 
                                $ret            = @checkListData($ret_id);
                                $stmChkDelDtl   = @$ret['stm']; 
                                $returnData     = @$ret['data']; 
                                $log            = @$ret['data']['log']; 
                        }
                } 
	break;
        case "EDIT" : 
                
                $f1 = $db->GetDataBySQL("select dc_product_type_id from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?",array($_REQUEST['ar_bill_invoice_hdr_id']));
               
                if($data['dc_product_type_id']!=$f1){
//                    echo $f1." == ".$data['dc_product_type_id']; exit;
                    $stmDelDtl = $db->QueryParam("DELETE FROM ar_bill_invoice_dtl where ar_bill_invoice_hdr_id=?", array($data["ar_bill_invoice_hdr_id"]));
                }
                $data["id"] = $data["ar_bill_invoice_hdr_id"]; 
		$arrParam = array();
		$upField = "";
		foreach($fld as $value)
		{
			if (!empty($data[$value]))
			{ 
				$upField .= ", {$value} = ?";
				$arrParam[] = $data[$value]; 
                                
                       }else if($value=='i_is_show_disc_cash' //save empty or 0
                                || $value=='i_is_show_txt_dtl' 
                                || $value=='pj_hdr_id'
                                || $value=='i_parent'
                                || $value=='i_is_invoice'
                                ){
                                $upField .= ", {$value} = ?";
				$arrParam[] = 0;       
                        } 
		}
		$sql = "UPDATE {$table} SET ".substr($upField, 1)." WHERE {$keyName} = ?"; 
		$arrParam[] = $data["id"];
		$stmChkMaster = $db->QueryParam($sql, $arrParam);
//chgHeader 
        $ret            = checkListData($data['id']);
        $returnData     = @$ret['data'];  
        $stmChkDelDtl   = @$ret['stm']; 
        $log            = @$ret['log'];
	break;
	case "DELETE" :
	$stmChkDelDtl = true;
	$stmChkMaster = true;
	$valid = 0;
		if($_REQUEST["statusBu"]=='del'){ 
		// ยังไม่ออกเลย ar && bl
		$sql = "Declare @idx as bigint;
						set @idx = ?; 
						delete from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id 		=@idx;
						delete from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id 		=@idx;
						delete from ar_process_month_report where ar_bill_invoice_hdr_id 	=@idx;
						"; 
			$arrParam= array($data["id"]);
                        $msg = "ท่านได้ลบเรียบร้อยแล้ว"; 
                        $returnData = array("invalid"=>0); 
                  
                        $stmChkMaster = $db->QueryParam($sql, $arrParam);     
                        
                }elseif($_REQUEST["statusBu"]=='cancel'){ 
		// ออกเลข ar ยังไม่ออกเลย bl
                    $onair  = 0;
                    $rec    = 0;
                    //
                    $adj    = 0;
                    $dec    = 0; 
                    //Overrid
                    $onair  = $db->GetDataBySQL("select top 1 count(*) from vw_ar_check_bill_onair where ar_bill_invoice_hdr_id = ?",array($_REQUEST['id']));
                    $rec    = $db->GetDataBySQL("select top 1 count(*) from vw_receive_all_bill where ar_bill_invoice_hdr_id = ?",array($_REQUEST['id']));
                    $adj    = $db->GetDataBySQL("select top 1 count(*) from ar_bill_invoice_hdr where isnull(i_enable,2)=1 and i_parent = ?",array($_REQUEST['id']));
                    $dec    = $db->GetDataBySQL("select top 1 count(*) from fi_dec_receive_hdr where isnull(i_enable,2)=1 and ar_bill_reduced_debt_id = ?",array($_REQUEST['id']));
 
                    //onair
                    
             if($adj==1) //ถ้าเป็น BL ที่มีรายการปรับปรุงหนี้อยู่ไม่สามารถยกเลิกรายการได้ 17-09-2010
			{
				$valid +=1;
                                $msg = "ไม่สามารถยกเลิก BL ได้ปรับปรุงหนี้อยู่ไม่สามารถยกเลิกรายการได้";
			}else if($dec==1)// ถ้าเป็น BL ที่มีรายการผูกกับรายการลดหนี้แล้วไม่ให้ยกเลิกรายการได้ 17-09-2010		
			{
				$valid +=1;
                                $msg = "ไม่สามารถยกเลิก BL ได้มีรายการผูกกับรายการลดหนี้แล้วไม่ให้ยกเลิกรายการได้";
			}else if($onair==1)//ถ้าใบวางบิลถูกบันทึกยืนยันรายได้แล้วไม่ให้ยกเลิกรายการได้ (แต่ให้ใช้งานรายการได้) 	
			{
				$valid +=1;
                                $msg = "ไม่สามารถยกเลิก BL ได้ถูกบันทึกยืนยันรายได้แล้วไม่ให้ยกเลิกรายการได้";
                                
			}else if($rec==1) //ถ้าใบวางบิลถูกรับเงินแล้วไม่ให้ยกเลิกรายการได้ (แต่ให้ใช้งานรายการได้)
			{
				$valid +=1;
                                $msg = "ไม่สามารถยกเลิก BL ได้ถูกรับเงินแล้วไม่ให้ยกเลิกรายการได้";
			} 
                        if($valid){ //
                           $returnData = array("invalid"=>1);     
                        }else{
                            
                            $sql = "UPDATE ar_bill_invoice_hdr
                                        SET i_enable=?
                                        ,dc_user_update_id =?
                                        ,dc_user_update_cost_id =?
                                        ,d_update =?
                                        WHERE ar_bill_invoice_hdr_id = ?;
                            Delete from ar_process_month_report where c_ref_doc like 'BL%' and ar_bill_invoice_hdr_id =?;
                            "; 

                            $arrParam= array(STATUS_DISABLE
                                            , $_SESSION["user_id"]
                                            , $_SESSION["dc_cost_id"]
                                            , date("Y-m-d H:i:s")
                                            , $data["id"]
                                            , $data["id"]);
                            $msg = "ท่านได้ยกเลิก BL เรียบร้อยแล้ว";
                            $returnData = array("invalid"=>0); 
                            $stmChkMaster = $db->QueryParam($sql, $arrParam);
							$db->QueryParam("EXEC SP_AR_PROCESS_MONTH_REPORT_DELETE_BL ?", array($data["id"])); 
                      } // End Check 
            }elseif($_REQUEST["statusBu"]=='enabled'){ 
		// ออกเลข ar ยังไม่ออกเลย bl
			$sql = "UPDATE ar_bill_invoice_hdr
                                        SET i_enable=?
                                        ,dc_user_update_id =?
                                        ,dc_user_update_cost_id =?
                                        ,d_update =?
                                        WHERE ar_bill_invoice_hdr_id = ?;
                        Delete from ar_process_month_report where c_ref_doc like 'BL%' and ar_bill_invoice_hdr_id =?;
                        "; 
					
                        $arrParam= array(STATUS_ENABLE
                                        , $_SESSION["user_id"]
                                        , $_SESSION["dc_cost_id"]
                                        , date("Y-m-d H:i:s")
                                        , $data["id"]
                                        , $data["id"]);
                        
                        $msg = "ท่านได้นำ BL กลับมาใช้งาน เรียบร้อยแล้ว"; 
                        $returnData = array("invalid"=>0); 
                        $stmChkMaster = $db->QueryParam($sql, $arrParam);

        } 
            
    break;
}
        
if ($stmChkDelDtl && $stmChkMaster)
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
