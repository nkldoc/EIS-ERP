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
$table 		= "ar_bill_invoice_dtl";
$keyName 	= "ar_bill_invoice_dtl_id";
 
$data = $util->mnUser($_REQUEST);  

$fld = array("ar_bill_invoice_hdr_id"
			,"ar_so_dtl_id"
			,"dc_product_id"
			,"dc_tax_id"
			,"f_tax_amt"
			,"f_quan"
			,"f_unit_cost"
			,"f_total_cost"
			,"f_disc_com"
			,"f_disc_cash"
			,"f_net_cost"
			,"i_receive"
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
           . ",(select count(*)+1 from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id=ar_bill_invoice_hdr.ar_bill_invoice_hdr_id) as i_seq"
           . " from ar_bill_invoice_hdr "
           . "where ar_bill_invoice_hdr_id=?", array($data['hdrID']));
		   
	$dc_product_group_id = $db->GetDataBySQL("select dc_product_group_id from dc_product where dc_product_id=?",array($data['dc_product_id'])); 
							
	$f2 = $db->GetDataBySQL("select a.dc_tax_id,a.f_tax_rate 
							from dc_tax a inner join dc_tax_def b on b.dc_tax_id=a.dc_tax_id 
							where b.dc_product_group_id=?",array($dc_product_group_id));  
							
		   
   $data['ar_bill_invoice_hdr_id']   	= $data['hdrID'];
   $data['ar_so_dtl_id']          		= 0; //no order
   $data['i_seq']          				= $f1['i_seq']; 
   
   $data['f_quan']						= floatval(preg_replace('/[^\d.]/', '', $data['f_quan']));
   $data['f_unit_cost']					= floatval(preg_replace('/[^\d.]/', '', $data['f_unit_cost']));
   $data['f_total_cost']				= floatval(preg_replace('/[^\d.]/', '', $data['f_total_cost']));
   
   $data['dc_tax_id'] 					= $f2['dc_tax_id']; 
   $data['f_tax_amt']              		= $mon->round54(($data['f_total_cost']*$f2['f_tax_rate']/100),2);
   
   $data['f_net_cost']              	= floatval($data['f_total_cost'])-floatval($data['f_tax_amt']); //หัก ณ ที่จ่าย
   
   
   $data['i_enable']       				= 1; 
   
   $data['dc_user_create_id']      		= $f1['dc_user_create_id'];   
   $data['dc_user_create_cost_id'] 		= $f1['dc_user_create_cost_id']; 
   $data['d_create']               		= $f1['d_create']; 
}
 
//print_r($data); exit;
 
/* 
function InvoiceDtl($id,$fq=null){
    global $db,$date ,$fld,$fld1,$mon;
        
        $f0 = $db->GetDataBySQL("select * from ar_bill_invoice_hdr where ar_so_hdr_id=?",array($_REQUEST['hdrID']));
       
	   $AR_WHT = $db->GetDataBySQL("select top 1 a.dc_tax_id from dc_tax_def a
                inner join ar_so_dtl d on a.dc_product_class_id = (select dc_product_class_id from dc_product_group 
                where dc_product_group_id in(select top 1 dc_product_group_id from dc_product_type where dc_product_type_id =?)
            )", array($f0['dc_product_type_id']));
        
        $f1         = $db->GetDataBySQL("select * from ar_so_dtl where ar_so_dtl_id=?",array($id));
        $f_tax_rate = $db->GetDataBySQL("select f_tax_rate from dc_tax where dc_tax_id=?",array($AR_WHT)); 
        
                $data = array();  
                $data['ar_bill_invoice_hdr_id']     = $f0["ar_bill_invoice_hdr_id"];     
                $data['f_total_cost']               = $f1["f_total_cost"];
                $data['f_disc_com']                 = $f1["f_disc_com"];
                $data['f_disc_cash']                = $f1["f_disc_cash"];
                $data['f_left_cost']                = $f1["f_total_cost"];   
                $data['f_net_disc_comm_amt']        = $f1["f_total_cost"]-$f1["f_disc_com"];
                $data['f_net_cost']                 = $f1["f_net_cost"]; 
                //Syncro
                $data['ar_so_dtl_id']           = $id; 
                //setValue 
                $data['dc_wht_tax_id']          = $AR_WHT;           //define("AR_WHT",  7); id ภาษีหัก ณ. ที่จ่าย แทนตัวเก่า   
                $data['f_wht_amt']              = $mon->round54(($f1['f_net_cost']*$f_tax_rate/100),2);
                $data['c_comment']              = isset($f1["comment"])?$f1["comment"]:null; 
       //info     
                $data['dc_user_create_id']      = $_SESSION["user_id"];
                $data['dc_user_create_cost_id'] = $_SESSION["dc_cost_id"];
                $data['d_create']               = date("Y-m-d H:i:s");

                $data['dc_user_update_id']      = $_SESSION["user_id"];
                $data['dc_user_update_cost_id'] = $_SESSION["dc_cost_id"];
                $data['d_update']               = date("Y-m-d H:i:s");    
                
        //print_r($f1);
        $arrParam   = array();		
        $addField   = "";
        $addValue   = ""; 
        $table      = "ar_bill_invoice_dtl";
        foreach($fld1 as $value)
        {  
            $addField .= ", {$value}";
            $addValue .= ", ?";
            $arrParam[] = $data[$value]; 
        } 

        $sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";  
        $sql.= "SELECT @@IDENTITY as id";
        $stmChkMaster = $db->QueryParam($sql, $arrParam);
#TODO Summary to Header 
 //UPDATE

           //SO
            $ret_id = $_REQUEST['hdrID']; 
            
            $f1  = $db->GetDataBySQL("select count(ar_so_dtl_id) as ct
                , isnull(sum(f_total_cost),0) as f_total_cost 
                , isnull(sum(f_net_cost),0) as f_net_cost
                , isnull(sum(f_disc_com_amt),0) as f_disc_com
                , isnull(sum(f_disc_cash_amt),0) as f_disc_cash
            from ar_so_dtl 
            where isnull(i_enable,2) = 1 and ar_so_hdr_id=?", array($ret_id));

            $sql2 = "UPDATE ar_so_hdr
            SET f_total_cost=?
            ,f_net_cost=?
            ,f_disc_com=?
            ,f_disc_cash=?
            ,dc_user_update_id =?
            ,dc_user_update_cost_id =?
            ,d_update =?
            WHERE ar_so_hdr_id = ?"; 

            $arrParam2= array($f1['f_total_cost']
                    , $f1['f_net_cost']
                    , $f1['f_disc_com']
                    , $f1['f_disc_cash']
                    , $_SESSION["user_id"]
                    , $_SESSION["dc_cost_id"]
                    , date("Y-m-d H:i:s")
                    ,$ret_id);
            $stmt2 = $db->QueryParam($sql2,$arrParam2);  
}


 */

$db->BeginTran();
$stmChkMaster 	= true; // as so 
$stmt2  	= true;       


switch ($mode) {

	case "ADD" :  
		$arrParam = array();		
		$addField = "";
		$addValue = "";

		foreach($fld as $value)
		{  
			if (!empty($data[$value]))
			{ 
				$addField .= ", {$value}";
				$addValue .= ", ?";
				$arrParam[] = $data[$value]; 
			}
		} 

		$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";  
		$sql.= "SELECT @@IDENTITY as id";
        $stmChkMaster = $db->QueryParam($sql, $arrParam);
        
        
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
            }else if($value=='f_tax_amt'){
				$upField .= ", {$value} = ?";
				$arrParam[] = 0; 
            }else if($value=='c_comment'){
				$upField .= ", {$value} = ?";
				$arrParam[] = null; 				
			}
 
		} 
		$sql = "UPDATE {$table} 
					SET ".substr($upField, 1)."
				WHERE {$keyName} = ?";
 
		$arrParam[] = $data["id"]; 
		$stmChkMaster = $db->QueryParam($sql, $arrParam); 
 
	break;

	case "DELETE" :  
		$sql = "Declare @idx as bigint;
				set @idx = ?; 
				delete from ar_bill_invoice_dtl where ar_bill_invoice_dtl_id =@idx;
				"; 
		$arrParam = array($data["id"]); 
            
        $stmChkMaster = $db->QueryParam($sql, $arrParam);
	break;
}
        
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
        
?>
