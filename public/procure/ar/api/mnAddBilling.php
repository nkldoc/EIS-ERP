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
 /*	[c_name_inv] [varchar](255) NULL,
	[c_address_inv] [varchar](255) NULL,
	[due_bill] [varchar](255) NULL,
	[condition_pay] [varchar](255) NULL, */       
 
$data = $util->mnUser($_REQUEST); 
$c_code_mu = "AR"; 
$msg = "บันทึกเรียร้อย";       
$fld = array("c_code"
            ,"c_ref_doc"
            ,"c_ref_code"
            ,"i_type_region"
            ,"dc_tax_id_vat"
            ,"vat_rate"
            ,"dc_tax_id_tax"
            ,"tax_rate" 
            ,"dc_cnt_id"
            ,"ar_so_hdr_id" 
            ,"c_adj_code"
            ,"i_type_status"
            ,"ar_condi_pay_hdr_id"
            ,"pj_send_period_hdr_id"
            ,"i_is_activity"
            ,"pj_hdr_id"
            ,"c_yyyy_mm"
            ,"i_is_billing"
            ,"i_is_invoice"
            ,"i_is_disc_cash"
            ,"i_is_show_txt_dtl"
            ,"i_is_show_disc_cash" 
            ,"d_billing_date"
            ,"d_end_credit"
            ,"d_doc_date"
            ,"i_is_tv"
            ,"i_is_status"
	  
            ,"dc_product_type_id"
            ,"i_no_order"
            ,"i_parent"
            ,"dc_area_id"
            ,"is_billing_cont"
            ,"i_class_type"
            ,"due_bill"
            ,"c_billing_name"
            ,"c_billing_addr"
    
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
        
    //setRequestToDB  
    
    $data["d_end_credit"]       = $date->bc_to_ad($data["d_end_credit"]);
    $data["d_doc_date"]         = $date->bc_to_ad($data["d_doc_date"]);
    $data["d_billing_date"]     = $date->bc_to_ad($data["d_billing_date"]); 
    $d_billing_date             = explode("-", $data["d_billing_date"]); 
    $data["i_is_show_disc_cash"] = (isset($data["i_is_show_disc_cash"]))?1:0;  
    $data["i_is_show_txt_dtl"]   = (isset($data["i_is_show_txt_dtl"]))?1:0; 
    $data["vat_rate"]           = $data["f_vat_rate"];  
    $data["dc_tax_id_vat"]      = $data["dc_vat_id"];   
    $data["c_billing_name"]     = $data["c_name_inv"];    
    $data["c_billing_addr"]     = $data["c_address_inv"];
        
    //Syn So to Billing 
    $f1 = $db->GetDataBySQL("select * from ar_so_hdr where ar_so_hdr_id = ?",array($_REQUEST['ar_so_hdr_id']));
    
    $f1 = $db->GetDataBySQL("select * from ar_so_hdr where ar_so_hdr_id = ?",array($_REQUEST['ar_so_hdr_id']));
    $area                       = $db->GetDataBySQL("select * from dc_cost where dc_cost_id=?", array($data['dc_cost_id']));
    $data["dc_area_id"]         = $area["dc_area_id"];
    
    $data["pj_hdr_id"]          = $f1['pj_hdr_id'];
    $data["dc_cnt_id"]          = $f1['dc_cnt_id'];
    $data["i_class_type"]       = $f1['i_class_type'];
    $data["i_type_region"]      = $f1['i_type_region'];
   
    $data["c_yyyy_mm"]          = $d_billing_date[0].$d_billing_date[1]; //วันวางบิล
    $data["is_billing_cont"]    = 1;
    $data["i_parent"]           = 0; 
    $data["i_is_invoice"]       = 0; 
    $data["i_no_order"]         = $f1['i_no_order'];
    
    $data["i_enable"]           = STATUS_ENABLE;
    $data["i_is_billing"]       = 1; //ส่วนของการวางบิล
    $data["vat_rate"]           = $data["f_vat_rate"];
    $data["dc_tax_id_vat"]      = $data["dc_vat_id"]; 
    $data["i_is_tv"]            = 1;     
    $data["i_is_status"]        = 1;    
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
//            $chek           = (isset($_REQUEST['removeDtl']))?$_REQUEST['removeDtl']:'';
//            
//            if($chek=='CHGHEADER')
//            {
//                $sqlDelDtl = "Declare @hdrID as bigint;
//                                 set @hdrID = ?;
//                                 delete from ar_so_dtl where ar_so_hdr_id =@hdrID;  
//                             ";  
//                 
//                $arrParamDelDtl = array($ret_id);  
//                $stmChkDelDtl   = $db->QueryParam($sqlDelDtl, $arrParamDelDtl);
//                $msgWanning     = "Yes Dtl removeDtl = {$chek}"; 
//            }else{
//                $msgWanning     = "NO Dtl removeDtl = "; 
//            } 
 //get to list 
            
           $row = $db->GetDataBySQL("select * from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=?", array($ret_id));
        
           return array("stm" =>$stmChkDelDtl,
                        "data" => array(
                            "id"            => $row['ar_bill_invoice_hdr_id'], 
                            "dc_product_type_id" => $row['dc_product_type_id'],
//                            "f_pj_amt"      => floatval($f_pj_amt),
//                            "f_dtl_amt"     => floatval($f_dtl_amt), 
//                            "order_type"    =>$order_type,
                            "msg"  => "บันทึกรายการเรียบร้อย"
//                            "onair_yyyy_mm" =>$row["onair_yyyy_mm"]?(@$date->l_month_thai[substr($row["onair_yyyy_mm"],4,2)]." ".(floatval(substr($row["onair_yyyy_mm"],0,4))+543)):null,
                        ),
               
                        "log" =>" id = ".$id
                );           
} //End Function 
  
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
				$arrParam[] = $data[$value];        
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
				$arrParam[] = $data[$value];       
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
		$f1 = $db->GetDataBySQL("select * from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id=?", array($data["id"]));
		$sql = "Declare @idx as bigint;
				Declare @idDtl as bigint;
						set @idx = ?; 
						set @idDtl=?;
						delete from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id 		=@idx;
						delete from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id 		=@idx; 
						update ar_so_dtl set i_billing = null where ar_so_dtl_id				=@idDtl; 
						"; 
		$arrParam = array($f1['ar_bill_invoice_hdr_id'],$f1['ar_so_dtl_id']);
			
		$msg = "ท่านได้ลบเรียบร้อยแล้ว"; 
		$returnData = array("invalid"=>0); 
		$stmChkMaster = $db->QueryParam($sql, $arrParam);     
                        
        }else if($_REQUEST["statusBu"]=='cancel'){ 
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
							
                      } // End Check 
            }elseif($_REQUEST["statusBu"]=='enabled'){ 
		// ออกเลข ar ยังไม่ออกเลย bl
			$sql = "UPDATE ar_bill_invoice_hdr
                                        SET i_enable=?
                                        ,dc_user_update_id =?
                                        ,dc_user_update_cost_id =?
                                        ,d_update =?
                                        WHERE ar_bill_invoice_hdr_id = ?; 
                        "; 
					
                        $arrParam= array(STATUS_ENABLE
                                        , $_SESSION["user_id"]
                                        , $_SESSION["dc_cost_id"]
                                        , date("Y-m-d H:i:s") 
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
