<?php include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php"); 
include("../../conf/configAr.php");
 
	function List_QueryParam() {
	
	global $db, $date, $util, $table, $root, $data, $sort,$dir,$i_read;
	
	$totalCount		= 0;
	$con			= null;
	$arrParam[] 	= DELETE_FALSE; 


 	if(!empty($_REQUEST["i_is_debtor"]) && $_REQUEST["i_is_debtor"]!='-1'){
		$con		.= " AND {$table}.i_is_debtor = ?";  
		$arrParam[]	= $_REQUEST["i_is_debtor"];  
		$txtCon[]	= $_REQUEST["i_is_debtorID"];
	}else{
		$txtCon[] 	= $_REQUEST["i_is_debtorID"];
	}
 
 	if(!empty($_REQUEST["dc_cnt_type_id"]) && $_REQUEST["dc_cnt_type_id"]!='-1'){
		$con		.= " AND {$table}.dc_cnt_type_id = ?";  
		$arrParam[]	= $_REQUEST["dc_cnt_type_id"];  
		$txtCon[]	= $_REQUEST["dc_cnt_type_idID"]; 
	}else{
		$txtCon[] 	= $_REQUEST["dc_cnt_type_idID"]; 
	}
 	if(!empty($_REQUEST["dc_tax_customer_id"]) && $_REQUEST["dc_tax_customer_id"]!='-1'){
		$con		.= " AND {$table}.dc_tax_customer_id = ?";  
		$arrParam[]	= $_REQUEST["dc_tax_customer_id"];  
		$txtCon[]	= $_REQUEST["dc_tax_customer_idID"];
	}else{
		$txtCon[] 	= $_REQUEST["dc_tax_customer_idID"];
	}

 	if(!empty($_REQUEST["i_daily_worker"]) && $_REQUEST["i_daily_worker"]!='-1'){
		$con		.= " AND {$table}.i_daily_worker = ?";  
		$arrParam[]	= $_REQUEST["i_daily_worker"];  
		$txtCon[]	= $_REQUEST["i_daily_workerID"];
	}else{
		$txtCon[] 	= $_REQUEST["i_daily_workerID"];
	}

 	if(!empty($_REQUEST["i_branch"]) && $_REQUEST["i_branch"]!='-1'){
		$con		.= " AND {$table}.i_branch = ?";  
		$arrParam[]	= $_REQUEST["i_branch"];  
		$txtCon[]	= $_REQUEST["i_branchID"];
	}else{
		$txtCon[] 	= $_REQUEST["i_branchID"];
	}

 	if(!empty($_REQUEST["i_enable"]) && $_REQUEST["i_enable"]!='-1'){
		$con		.= " AND {$table}.i_enable = ?";  
		$arrParam[]	= $_REQUEST["i_enable"];  
		$txtCon[]	= $_REQUEST["i_enableID"];
	}else{
		$txtCon[] 	= $_REQUEST["i_enableID"];
	}
	
	$sqlMain	= "select {$table}_id 
					 ,(select top 1 c_name from dc_cnt_type where dc_cnt_type_id={$table}.dc_cnt_type_id) as dc_cnt_type_id
					 ,dc_acc_id
					 ,(select top 1 c_code from dc_acc where dc_acc_id={$table}.dc_acc_id_cred) as acc_code
					 ,(select top 1 c_name from dc_acc where dc_acc_id={$table}.dc_acc_id_cred) as acc_name
					 ,dc_tax_customer_id
					 ,dc_cost_id 
					 ,dc_title_id
					 ,c_old_code
					 ,c_code
					 ,c_name
					 ,c_surname
					 ,c_address
					 ,c_telephone
					 ,c_mobile
					 ,c_fax
					 ,c_website
					 ,c_email
					 ,c_tax_value
					 ,dc_bank_id
					 ,dc_bank_branch_id
					 ,c_bank_no
					 ,dc_ref_type_id
					 ,c_ref_value
					 ,i_is_debtor
					 ,i_group_cnt
					 ,i_is_creditor
					 ,i_is_agency
					 ,f_debt_amount
					 ,f_credit_amount
					 ,parent_id
					 ,order_id
					 ,i_is_fixed
					 ,c_comment
					 ,i_company_pay_tax 
					 ,i_is_ins 
					 ,due_bill
					 ,dc_cost_old_id
					 ,i_tax_fix
					 ,dc_tax_id
					 ,f_dec_rate
					 ,f_tax_reduce
					 ,dc_disc_type_id
					 ,dc_bank_acc_dfl_id
					 ,i_key_later
					 ,c_name_inv
					 ,c_address_inv
					 ,c_add_bank1
					 ,c_add_bank2
					 ,c_add_bank3
					 ,c_add_bank4
					 ,c_address_inv2
					 ,cnt_type
					 ,title_name
					 ,dc_bank_acc
					 ,f_cnt_tax
					 ,dc_tax_name
					 ,i_dec_person
					 ,emp_create_name
					 ,emp_update_name
					 ,cost_create_name
					 ,cost_update_name
					 ,i_credit_card
					 ,c_credit_name
					 ,i_daily_worker
					 ,i_branch
					 ,c_branch
					 ,i_enable 
					,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
					,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
					, convert(varchar, d_create, 120) as d_create
					,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
					,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
					, convert(varchar, [d_update], 120) as d_update 
					, row_number() over (order by $sort $dir) as row from {$table}
					where isnull(i_delete,".DELETE_FALSE.") = ? $con".$util->viewAcc($i_read);
 
	$i = 1;
	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	if( $stmt ) {
		while( $row = $db->Fetch( $stmt ) ) { 
		$temp = array("no" => ($i++), 
						"id"				=> $row["{$table}_id"],
						"dc_cnt_id" 		=> $row["dc_cnt_id"],
						"dc_cnt_type_id" 	=> $row["dc_cnt_type_id"],
						"dc_acc_id" 		=> $row["dc_acc_id"],
						/* "dc_acc_id_cred" 	=> $row["dc_acc_id_cred"], */
						"dc_tax_customer_id" => $row["dc_tax_customer_id"],
						"dc_cost_id" => $row["dc_cost_id"],
						"dc_title_id" => $row["dc_title_id"],
						"c_old_code" => $row["c_old_code"],
						"c_code" => $row["c_code"],
						"c_name" => $row["c_name"],
						"c_surname" => $row["c_surname"],
						"c_address" => $row["c_address"],
						"c_telephone" => $row["c_telephone"],
						"c_mobile" => $row["c_mobile"],
						"c_fax" => $row["c_fax"],
						"c_website" => $row["c_website"],
						"c_email" => $row["c_email"],
						"c_tax_value" => $row["c_tax_value"],
						"dc_bank_id" => $row["dc_bank_id"],
						"dc_bank_branch_id" => $row["dc_bank_branch_id"],
						"c_bank_no" => $row["c_bank_no"],
						"dc_ref_type_id" => $row["dc_ref_type_id"],
						"c_ref_value" => $row["c_ref_value"],
						"i_is_debtor" => $row["i_is_debtor"],
						"i_group_cnt" => $row["i_group_cnt"],
						"i_is_creditor" => $row["i_is_creditor"],
						"i_is_agency" => $row["i_is_agency"],
						"f_debt_amount" => $row["f_debt_amount"],
						"f_credit_amount" => $row["f_credit_amount"],
						"parent_id" => $row["parent_id"],
						"order_id" => $row["order_id"],
						"i_is_fixed" => $row["i_is_fixed"],
						"c_comment" => $row["c_comment"],
						"i_company_pay_tax" => $row["i_company_pay_tax"], 
						"i_is_ins" => $row["i_is_ins"], 
						"due_bill" => $row["due_bill"],
						"dc_cost_old_id" => $row["dc_cost_old_id"],
						"i_tax_fix" => $row["i_tax_fix"],
						"dc_tax_id" => $row["dc_tax_id"],
						"f_dec_rate" => $row["f_dec_rate"],
						"f_tax_reduce" => $row["f_tax_reduce"],
						"dc_disc_type_id" => $row["dc_disc_type_id"],
						"dc_bank_acc_dfl_id" => $row["dc_bank_acc_dfl_id"],
						"i_key_later" => $row["i_key_later"],
						"c_name_inv" => $row["c_name_inv"],
						"c_address_inv" => $row["c_address_inv"],
						"c_add_bank1" => $row["c_add_bank1"],
						"c_add_bank2" => $row["c_add_bank2"],
						"c_add_bank3" => $row["c_add_bank3"],
						"c_add_bank4" => $row["c_add_bank4"],
						"c_address_inv2" => $row["c_address_inv2"],
						"cnt_type" => $row["cnt_type"],
						"title_name" => $row["title_name"],
						"dc_bank_acc" => $row["dc_bank_acc"],
						"f_cnt_tax" => $row["f_cnt_tax"],
						"dc_tax_name" => $row["dc_tax_name"],
						"i_dec_person" => $row["i_dec_person"],
						"emp_create_name" => $row["emp_create_name"],
						"emp_update_name" => $row["emp_update_name"],
						"cost_create_name" => $row["cost_create_name"],
						"cost_update_name" => $row["cost_update_name"],
						"i_credit_card" => $row["i_credit_card"],
						"c_credit_name" => $row["c_credit_name"],
						"i_daily_worker" => $row["i_daily_worker"],
						"i_branch" => $row["i_branch"],
						"c_branch" => $row["c_branch"], 
						"i_enable" => $row["i_enable"],
						"acc_code" => $row["acc_code"],
						"acc_name" => $row["acc_name"],
						"dc_user_create_id" 		=> $row["c_create_name"],
						"dc_user_create_cost_id" 	=> $row["c_cost_creat_name"],
						"d_create" 					=> $date->extDateBuddha($row["d_create"]),
						"dc_user_update_id" 		=> $row["c_update_name"],
						"dc_user_update_cost_id" 	=> $row["c_cost_update_name"],
						"d_update" 					=> $date->extDateBuddha($row["d_update"])
					);
			${$root}[] = $temp;
		} 
	} 
	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root},'txtCon'=>$txtCon));
}

	function headerX($t='',$rd){
		 
		$title= $_REQUEST['titleReport'];
		$tt = isset($t) && $t!=''?true:false;
		switch($t)
		{ 
			case 'excel': $ttt = 'xls'; break; 
			case 'downloadHTML': $ttt = 'html'; break;  
			case 'html': $ttt 	= ''; break;
			default: $ttt='';
		} 
  		if($ttt!=''){
			header("Content-Type: application/octet-stream");
			header("Content-Transfer-Encoding: binary");
			header('Expires: '.gmdate('D, d M Y H:i:s').' GMT');
			header('Content-Disposition: attachment; filename = "'.$title.' '.date("Y-m-d-H-i-s").'.'.$ttt.'"');
			header('Pragma: no-cache');  
			echo chr(255).chr(254).iconv("UTF-8", "UTF-16LE//IGNORE", $rd);  
		}else{
			header('Content-Type: text/html; charset=utf-8');
			echo '<style type="text/css">
			.text_report_buy { FONT-SIZE: 14px; COLOR: #00000; FONT-FAMILY: Tahoma} 
			.table_report_buy { FONT-SIZE: 12px; COLOR: #00000; FONT-FAMILY: Tahoma}
			.tr_report_buy { FONT-SIZE: 9px; COLOR: #00000; FONT-FAMILY: Tahoma} 
			thead tr, tbody td, tbody th { border: 1px solid #eee; }
			tbody > tr:nth-child(even) { background: #FFF } tbody > tr:nth-child(odd) { background: #CCC } </style>';
			echo $rd;
		}   
	}; //Function 
	###################
	$db 	= new DatabaseServer();
	$date 	= new i_date();
	$util	= new apiUtil();
 
	######################################

	$table		= "dc_cnt";
	$dir 		= "ASC"; 
	$sort 		= "{$table}.c_code"; 
	$root		= "data";
	$data		= array();
 
	
	$arr_deb  		= array("-1"=>"ทั้งหมด",AR_CONTACT_PERSONAL_TYPE1=>"ลูกหนี้",AR_CONTACT_PERSONAL_TYPE2=>"ลูกหนี้/เจ้าหนี้",AR_CONTACT_PERSONAL_TYPE3=>"เจ้าหนี้");
	$arr_cnt_office = array("-1"=>"ทั้งหมด",AR_HEAD_OFFICE=>"สำนักงานใหญ่",AR_BRANCH_OFFICE=>"สาขา",AR_OTHER_OFFICE=>"อื่นๆ");
	
	$arr_employee	= array(AR_EMPLOYEE1=>"ลูกจ้างรายวัน"
							,AR_EMPLOYEE2 =>"ลูกจ้างรายวันไม่มีสัญญาจ้าง"
							,AR_EMPLOYEE3=>"ลูกจ้างรายวันมีสัญญาจ้าง"
							,AR_EMPLOYEE4=>"ลูกจ้างรายชั่วโมงไม่มีสัญญาจ้าง"
							,AR_EMPLOYEE5=>"ลูกจ้างอื่นๆ"
							,AR_EMPLOYEE6=>"ไม่เป็นลูกจ้าง"
							); 	
	$arr_status 	= array("-1"=>"ทั้งหมด", "1"=>"ใช้งาน", "2"=>"ไม่ใช้งาน");
	 
	
	$stTbl 		= ' style="border: 1px solid black; background-color: #ccc; font-size:12px; width:100%;  "';
	$stHeader	= ' nowrap style="background-color: #eee; text-align:center; font-weight:bold;"';
	$stTitle 	= ' nowrap style="background-color: #eee; text-align:left; font-weight:bold;"';
	$stTh 		= ' nowrap style="background-color: #eee; text-align:center;"';
	$stTd 		= ' style="background-color: #fff;font-size:12px; "';
 
	$title		= "บริษัท อสมท จำกัด (มหาชน)";  
	
	$thead[]	= "ลำดับที่";
	$thead[]	= "รหัส";
	$thead[]	= "รหัสเดิม";
	$thead[]	= "ประเภท";
	$thead[]	= "ประเภทลูกค้า/เจ้าหนี้";
	$thead[]	= "ชื่อลูกค้า/เจ้าหนี้";
	$thead[]	= "สถานประกอบการ";
	$thead[]	= "สถานะลูกจ้าง";
	$thead[]	= "ที่อยู่";
	$thead[]	= "บ้านเลขที่  หมู่ที่  อาคาร ชั้น";
	$thead[]	= "ซอย ถนน ตำบล";
	$thead[]	= "อำเภอ  จังหวัด";
	$thead[]	= "รหัสไปรษณีย์";
	$thead[]	= "โทรศัพท์";
	$thead[]	= "โทรศัพท์เคลื่อนที่";
	$thead[]	= "โทรสาร";
	$thead[]	= "เลขประจำตัวประชาชน";
	$thead[]	= "เลขประจำตัวผู้เสียภาษี";
	$thead[]	= "คำอธิบายเพิ่มเติม";
	$thead[]	= "บัญชีเจ้าหนี้";
	$thead[]	= "บัญชีเงินฝาก";
	$thead[]	= "สถานะ";
 
	$data_dtl	= json_decode(List_QueryParam(), true);

	$tbody = null;
	if(is_array($data_dtl['data']))
	foreach($data_dtl['data'] as $row)
	{ 
 
		$link_acc = "<a href ='./getBankCnt.php?dc_cnt_id=".$row['dc_cnt_id']."' target='_blank'><font color=#990033>รายละเอียด</a>";
	
		$tbody .= '<tr><td align="center" '.$stTd.'> '.$row["no"].'</td>'; //
		$tbody .= '<td '.$stTd.'> '.$row["c_code"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_old_code"].'</td>';
		$tbody .= '<td '.$stTd.'> '.@$arr_deb[$row["i_is_debtor"]].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["dc_cnt_type_id"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_name"].'</td>';
		$tbody .= '<td '.$stTd.'> '.@$arr_cnt_office[$row["i_branch"]].'</td>';
		$tbody .= '<td '.$stTd.'> '.@$arr_employee[$row["i_daily_worker"]].'</td>'; 
		$tbody .= '<td '.$stTd.'> '.$row["c_address"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_add_bank1"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_add_bank2"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_add_bank3"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_add_bank4"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_telephone"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_mobile"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_fax"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_ref_value"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_tax_value"].'</td>';
		$tbody .= '<td '.$stTd.'> '.$row["c_comment"].'</td>';		
		$tbody .= '<td '.$stTd.'> '.$row["acc_code"].' '.$row["acc_name"].'</td>'; 
		$tbody .= '<td '.$stTd.'> '.$link_acc.'</td>';
		$tbody .= '<td '.$stTd.'> '.@$arr_status[$row["i_enable"]].'</td></tr>';
	}
 
	$rd = null;
	$rd =  "<div align=\"center\"><strong>".$_REQUEST['titleReport']."</strong></div>";
	$rd .= "<div align=\"left\"><strong>ประเภท  : ".$data_dtl['txtCon'][0]."</strong></div>"; 
	$rd .= "<div align=\"left\"><strong>ประเภทลูกค้า/เจ้าหนี้  :  ".$data_dtl['txtCon'][1]." </strong></div>"; 
	$rd .= "<div align=\"left\"><strong>ประเภทกิจการ   : ".$data_dtl['txtCon'][2]."</strong></div>"; 
	$rd .= "<div align=\"left\"><strong>สถานะลูกจ้าง  : ".$data_dtl['txtCon'][3]."</strong></div>"; 
	$rd .= "<div align=\"left\"><strong>สถานประกอบการ  :".$data_dtl['txtCon'][4]."</strong></div>"; 
	$rd .= "<div align=\"left\"><strong>สถานะ  : ".$data_dtl['txtCon'][5]."</strong></div>"; 
	
	//set Print Head new page text_report_buy
	
	$rd .=  '<table width="100%" class="text_report_buy" border="0" style="background-color:#000;" cellspacing="1" cellpadding="0" style="page-break-after: always;">';
	$rd .=  '<thead valign="top">';
	$rd .=  '<tr>';
		foreach ($thead as $value) {
			$rd .=  '<th '.$stTh.'>'.$value.'</th>';
		}
	$rd .=  '</tr>'; 
	$rd .=  '</thead>'; 
	$rd .=  $tbody;
	$rd .=  '</table>'; 
	
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$rd);	
?>





 