<?php
	include("../../conf/config.php");
	include("../../lib/database/DatabaseServer.php");
	include("../../lib/database/apiUtil.php");
	include("../../lib/date/i_date.class.php");
	include("../../lib/mon/mon.class.php"); 
	include("./class/class.PrintHtml.php"); 

	
	


	
	$db = new DatabaseServer(); 
	$m = $db->json_clean_decode($_REQUEST['sumDtl']); //jsonText to Obj
 
 
 
	$date 	= new i_date();
	$util	= new apiUtil();
	$mon 	= new mon(); // convert floatval
 
	$mode		= $_REQUEST["mode"];
	$table 		= "ar_bill_invoice_hdr";
	$keyName 	= "ar_bill_invoice_hdr_id";
 

	$data = $util->mnUser($_REQUEST); 
	 
	$arr_status = array(null=>"ยังไม่ออกเลข BL",1=>"ออกเลข BL",2=>"วางบิลไปแล้วบางส่วน",3=>"สมบูรณ์(เต็มใบ)",4=>"สมบูรณ์(ยกเลิกบางส่วน)"); 
 
	function getCode($id,$c_code_mu){
		global $db;
			$ret_id 		= $id;   
			$code_dc 		= (string) $c_code_mu;
			$arrParam  		= array($code_dc,date("Ym"),$_SESSION["user_id"],$_SESSION["dc_cost_id"],$ret_id); 
			$sql			= "EXEC SP_GEN_CODE ?,?,?,?,?;"; 
			$stmt           = $db->QueryParam($sql,$arrParam); 
			$arr_gen_code   = $db->Fetch($stmt);
			$c_code 		= $arr_gen_code["c_code_gen"];
			$ref_id   		= $arr_gen_code["reference_id"]; 
			
			return array($c_code,$ret_id,$ref_id); 
	}//End 
	
	$db->BeginTran();
	$stmChkMaster 	= true; // as so 
	$stmChkDelDtl 	= true; // as dtl
	$c_invoice_item = null;
	switch ($mode) {  
		case "REPRINT" : 
		break;
		case "GENCODEPRINT" : 
		 //PRINTING JSON
		 $data = array();
		 $i = 0;
		 foreach($_REQUEST['ar_bill_invoice_dtl_id'] as $val){ 
		 /* i_seq c_invoice_item f_quan f_unit_cost f_total_cost  */
			 $i++;
			 if($i==1)$c_invoice_item = $_REQUEST["items{$val}"];
			 $itms = array( 
					"i_detail" 			=> 1,
					"i_seq" 			=> $_REQUEST["i_seq{$val}"],
					"c_invoice_item" 	=> $_REQUEST["items{$val}"],
					"c_comment" 		=> $_REQUEST["c_comment{$val}"],
					"f_quan" 			=> $_REQUEST["f_quan{$val}"],
					"f_unit_cost" 		=> $_REQUEST["f_unit_cost{$val}"],
					"f_total_cost" 		=> $_REQUEST["f_total_cost{$val}"]
					
				 ); 
			$data[] = $itms;
		 } 
			$i++;
			$data[] = array( 
				"i_detail" 			=> 0,
				"i_seq" 			=> $i,
				"c_invoice_item" 	=> "ราคารวม",  
				"f_total_cost" 		=> $_REQUEST["f_total_cost_sum"]
			 );  
			$i++;
			$data[] = array( 
				"i_detail" 			=> 0,
				"i_seq" 			=> $i,
				"c_invoice_item" 	=> "ภาษีมูลค่าเพิ่ม",  
				"f_total_cost" 		=> $_REQUEST["f_vat_amt_sum"]
			 ); 
			$i++; 
			$data[] = array( 
				"i_detail" 			=> 0,
				"i_seq" 			=> $i,
				"c_invoice_item" 	=> "ภาษีหัก ณ ที่จ่าย",  
				"f_total_cost" 		=> $_REQUEST["f_tax_amt_sum"]
			 );
			$i++;
			$data[] = array( 
				"i_detail" 			=> 0,
				"i_seq" 			=> $i,
				"c_invoice_item" 	=> "ยอดสุทธิ",  
				"f_total_cost" 		=> $_REQUEST["f_net_cost_sum"]
			 );
			$i++;			
			$data[] = array( 
				"i_detail" 			=> -1,
				"i_seq" 			=> $i, 
				"f_total_cost" 		=> $_REQUEST["f_net_text"] 
			 );  
			$i++;
			$data[] = array( 
				"i_detail" 			=> -2,
				"i_seq" 			=> $i,
				"c_invoice_item" 	=> $_REQUEST["c_invoice_item1"] 
			 );  
			$i++;
			$data[] = array( 
				"i_detail" 			=> -3,
				"i_seq" 			=> $i,
				"c_invoice_item" 	=> $_REQUEST["c_invoice_item2"] 
			 );
			 
			$res = array("header"=>$_REQUEST['id'],"detail"=>$data);
			$jsonDtl = json_encode($res);
			
		// สถานะ(null=>ยังไม่ออกเลข BL,1=>ออกเลข BL ,2=>วางไปแล้วบางส่วน,3=>สมบูรณ์(เต็มใบ),4=>สมบูรณ์(ยกเลิกบางส่วน)); 
		// GENCODE
		/*
		*
		*
		*/
 
		$arCode 	= getCode($_REQUEST["id"],"BL"); 	/* echo "{$arCode[0]} ,{$arCode[1]} , {$arCode[2]} "; exit; */
		$arCodeInv 	= getCode($_REQUEST["id"],"INV"); 	/* echo "{$arCode[0]} ,{$arCode[1]} , {$arCode[2]} "; exit; */
		
		$print 		= new PrintHtml($db,$date,$mon); 
		$htmlPrint  = $print->Html($_REQUEST["id"],$arCodeInv[0],$res);
 
        if($arCode[1]==$arCode[2] && $arCode[1]==$arCode[2])
        {
			$sql = "update ar_bill_invoice_hdr SET c_code	='{$arCodeInv[0]}' 
								, bl_code					='{$arCode[0]}' 
								, json_print_dtl			= '{$jsonDtl}' 
								, i_is_status 				= 1 
								, c_invoice_item			= '{$c_invoice_item}'
								, f_net_cost 				= ".(floatval(preg_replace('/[^\d.]/', '', $m->f_net_cost)))."
								, f_before_edit_vat 		= ".(floatval(preg_replace('/[^\d.]/', '', $m->f_before_edit_vat)))."
								, f_vat_amt 				= ".(floatval(preg_replace('/[^\d.]/', '', $m->f_vat_amt)))."
								, f_tax_amt 				= ".(floatval(preg_replace('/[^\d.]/', '', $m->f_tax_amt)))."
								, dc_user_update_id 		= ".$_SESSION["user_id"]."
								, dc_user_update_cost_id 	= ".$_SESSION["dc_cost_id"]."
								, d_update ='".date("Y-m-d H:i:s")."' WHERE {$keyName} = '{$_REQUEST["id"]}'"; 		
			$stmt2 = $db->Query($sql);
			//check 
			$f1 = $db->GetDataBySQL("select * from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=?", array($_REQUEST["id"]));
			$sql = "update ar_so_hdr SET i_is_status=3
								, dc_user_update_id 		= ".$_SESSION["user_id"]."
								, dc_user_update_cost_id 	= ".$_SESSION["dc_cost_id"]."
								, d_update ='".date("Y-m-d H:i:s")."' WHERE ar_so_hdr_id = '{$f1["ar_so_hdr_id"]}'"; 		
			$stmt3 = $db->Query($sql);
			
			$db->QueryParam("EXEC SP_AR_PROCESS_MONTH_REPORT_INSERT_BL ?", array($_REQUEST["id"])); 
        }			
 
		$returnData = array(
			"c_code" 	=>$arCode[0],
			"jsonDtl"	=>$jsonDtl,
			"html" 		=> $htmlPrint 
		);
		break;

	}    
	if ($stmChkMaster)
	{
		$db->CommitTran();
		$re = array("reval"=>0,"success"=>"Success","msg"=>"บันทึกเรียร้อย","data"=>$returnData);
	}
	else
	{
		$db->RollBackTran();
		$re = array("reval"=>1,"success"=>"Error","msg"=>"Error");
	}
	echo json_encode($re); exit; 
?>
