<?php 	
	//Center Config
	include("../../../conf/config.php"); 
	include("../../../lib/database/DatabaseServer.php");
	include("../../../lib/database/apiUtil.php");
	include("../../../lib/date/i_date.class.php");
	//Local config
	include("./../../conf/config_po.php");  
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
			echo '<link rel="stylesheet" type="text/css" href="./../../../css/print_report.css"/>';
			echo $rd;
		}   
	}; //Function
 
	###################
	$db 	= new DatabaseServer();
	$date 	= new i_date();
	$util	= new apiUtil();
	########################################################################## 
	$table	= "ap_po_hdr";
	$dir 	= "ASC"; 
	$sort 	= "{$table}.dc_cnt_id, {$table}.c_po_no, b.i_seq"; 
 
	################### 
	$con		= null;
	$i 			= 0; 
	$arrParam 	= []; 
	
		//iSearch&date  
	$dd1	= $date->bc_to_ad(substr($_REQUEST["d_begin_date"],0,10));
	$dd2	= $date->bc_to_ad(substr($_REQUEST["d_end_date"],0,10));  
	
	$con	.= " isnull(c.dc_cnt_id,0)!=0 AND {$table}.d_doc_date between ? AND ?";
	$arrParam[]	= $dd1;
	$arrParam[]	= $dd2; 
	  
	if(!empty($_REQUEST["dc_cnt_id"]) && $_REQUEST["dc_cnt_id"]!='-1'){
		$con	.= " AND {$table}.dc_cnt_id = ?";  
		$arrParam[]	= $_REQUEST["dc_cnt_id"]; 
		
		$txtCost = $_REQUEST["txtdc_cnt_idID"];
	}else{
		$txtCost ='ทั้งหมด';
	}
 
	if(!empty($_REQUEST["dc_bg_type_id"]) && $_REQUEST["dc_bg_type_id"]!='-1'){
		$con	.= " AND {$table}.dc_bg_type_id = ?";  
		$arrParam[]	= $_REQUEST["dc_bg_type_id"];
		
		$txtBgType = $_REQUEST["dc_bg_type_idID"];
	}else{
		$txtBgType ='ทั้งหมด';
	} 
 
	$sqlTempTable = "select {$table}.ap_po_hdr_id
							, {$table}.c_po_no 
							, {$table}.dc_cnt_id
							, {$table}.c_contract_no
							, {$table}.c_doc_resp_no
							, {$table}.i_is_purchase
							, {$table}.i_is_success
							, convert(varchar, {$table}.d_doc_date, 120) as d_doc_date 
							, b.c_name 
							, c.c_name as c_cnt_name
							, c.c_address
							, c.c_mobile
							, c.c_telephone
							, isnull(b.f_net_cost,0) as f_total_amount
							, isnull(b.i_seq,0) as i_seq
							, isnull(b.i_is_delivery,0) as i_is_delivery
							, isnull(b.i_is_audit,0) as i_is_audit
							, (select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_cost_id) as dc_cost_name
							 
							, (select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
							, (select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
							, convert(varchar, {$table}.d_create, 120) as d_create
							, (select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
							, (select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
							, convert(varchar, {$table}.d_update, 120) as d_update 
					, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row		
				FROM {$table} 
					INNER JOIN ap_period_hdr b ON {$table}.ap_po_hdr_id = b.ap_po_hdr_id 
					INNER JOIN dc_cnt c ON {$table}.dc_cnt_id = c.dc_cnt_id 
					
				WHERE {$con}
				GROUP BY {$table}.ap_po_hdr_id
							, {$table}.c_po_no 
							, b.c_name 
							, c.c_name 
							, c.c_address
							 
							, c.c_mobile
							, c.c_telephone
							, b.f_net_cost
							, b.i_seq
							, b.i_is_delivery
							, b.i_is_audit
							,{$table}.dc_cnt_id
							,{$table}.dc_cost_id
							,{$table}.d_doc_date
							,{$table}.c_doc_resp_no
							,{$table}.c_contract_no
							,{$table}.i_is_purchase
							,{$table}.i_is_success
							,{$table}.dc_user_create_id
							,{$table}.dc_user_create_cost_id
							,{$table}.d_create
							,{$table}.dc_user_update_id
							,{$table}.dc_user_update_cost_id
							,{$table}.d_update
				 
				";   
 
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a ";  
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	//html
	$stTbl 		= ' style="border: 1px solid black; background-color: #ccc; font-size:14px; width:100%;  "';
	$stHeader	= ' nowrap style="background-color: #eee; text-align:center; font-weight:bold;"';
	$stTitle 	= ' nowrap style="background-color: #eee; text-align:left; font-weight:bold;"';
	$stTh 		= ' nowrap style="background-color: #eee; text-align:center;"';
	$stTd 		= ' style="background-color: #fff;"';
	//printer
	$rd = '';
	$rd .='<div class="book">';
	$rd .='<div class="page">';
	$rd .='<div class="subpage">';

		$rd ='<table '.$stTbl.'>'; 
		// Head&Title
		//$rd .= '<tr><td '.$stHeader.' colspan="14">'.$_REQUEST['titleReport'].'</td></tr>'; 		
		$rd .= '<tr><td '.$stTitle.' align="left" colspan="14">';
		// Condition
		
			$rd .= '<h2 align="center">'.$_REQUEST['titleReport'].'</h2>'; 	 
			$rd .='<p style="color:green; text-indent:15cm; text-align:justify;">';
			$rd .= '<br/>เลือกผู้ขาย/ผู้รับจ้าง  :  '.$txtCost;
			$rd .= '<br/>ประเภทงบประมาณ :  '.$txtBgType; 
			$rd .= '<br/>ระหว่างวันที่  : '.substr($_REQUEST["d_end_date"],0,10) .'  ถึง  '.substr($_REQUEST["d_begin_date"],0,10).'<br/>'; 
			$rd .='</p>';
		$rd .= '</td></tr>';
		// column
		
	$f_total_amount = 0;
	$cnt_id = 0;

	
	while($row =$db->Fetch($stmt))				
	{
 
		 ////////////////// 
			if($row['i_is_purchase']==1)$purchase = "จัดซื้อ";
			else if($row['i_is_purchase']==2)$purchase = "จัดเช่า";
			else $purchase = "จัดจ้าง";
			
			if($row['i_is_audit']==1)$audit = "ตรวจรับแล้ว"; 
			else $audit = "<p style='color:red'>ยังไม่ตรวจรับ</p>";
			
			if($row['i_is_delivery']==1)$delivery="ส่งแล้ว";
			else $delivery="<p style='color:red'>ยังไม่ส่งของ</p>"; 
		 //////////////////
		 
		if($cnt_id!=$row['dc_cnt_id']){
			
		
		 $cnt = 'เลือกผู้ขาย/ผู้รับจ้าง  :: '.$row['c_cnt_name'].'<br/>';
		 $cnt .= 'ที่อยูู่  ::  '.$row['c_address'].'<br/>';
		 $cnt .= 'เบอร์โทร  ::  '.$row['c_telephone'].'&nbsp;';
		 $cnt .= 'มือถือ  ::  '.$row['c_mobile'].'<br/>';
		 
		  	$rd .= '<tr id="header">
						<td '.$stTd.' colspan="14">'.$cnt.'</td> 
					</tr>';	 
			$rd .= '<tr>
				<th '.$stTh.'>ลำดับ</th>
				<th '.$stTh.'> เลขที่ใบสั่ง ซื้อ/จ้าง/เช่า</th>
				<th '.$stTh.'> เลขที่หนังสือ สนองราคา</th> 
				<th '.$stTh.'> เลขที่สัญญา</th>
				<th '.$stTh.'> วันที่ จัดซื้อ/จัดจ้าง</th>
				<th '.$stTh.'> รายการที่สั่ง ซื้อ/จ้าง/เช่า</th> 
				<th '.$stTh.'> งวด</th>
				<th '.$stTh.'> ประเภท</th>
				<th '.$stTh.'> วงเงิน จัดซื้อ/จัดจ้าง</th> 
				<th '.$stTh.'> สถานะการส่งของ</th>
				<th '.$stTh.'> การตรวจรับ</th> 
				<th '.$stTh.'> หน่วยงานเจ้าของเรื่อง</th>
				<th '.$stTh.'> ผู้ที่สร้าง</th>
				<th '.$stTh.'> ผู้แก้ไข</th> 
			</tr>';
			$cnt_id = $row['dc_cnt_id'];
		}	
			$rd .= '<tr>
					<td '.$stTd.' align="center"><a href="./getPoDetail.php?id='.$row["ap_po_hdr_id"].'" target="_Blank">'.$row["row"].'</a></td>
					<td '.$stTd.'> '.$row["c_po_no"].'</td>
					<td '.$stTd.'> '.$row['c_doc_resp_no'].'</td> 
					<td '.$stTd.'> '.$row['c_contract_no'].'</td>
					<td '.$stTd.'> '.$date->extDateBuddha($row["d_doc_date"]).'</td> 
					<td '.$stTd.'> '.$row["c_name"].'</td> 
					<td '.$stTd.'> '.$row["i_seq"].'</td>
					<td '.$stTd.'> '.$purchase.'</td>
					<td '.$stTd.' align="right"> '.number_format($row["f_total_amount"],2).'</td> 
					<td nowrap '.$stTd.'> '.$delivery.'</td>
					<td nowrap '.$stTd.'> '.$audit.'</td> 
					<td '.$stTd.'> '.$row["dc_cost_name"].'</td>
					<td '.$stTd.'> '.$row["c_create_name"].'</td>
					<td nowrap '.$stTd.'> '.$row["c_cost_update_name"].'</td> 
				</tr>';	
	
	$f_total_amount += $row["f_total_amount"];	
	}
	
  	$rd .= '<tr class="footer-report">
					<td colspan="8" align="right"> <span class="underline">รวมทั้งหมด </span></td>
					<td align="right">'.number_format($f_total_amount,2).'</td>
					<td colspan="5">&nbsp;</td>
			</tr>';	 
	$rd .= '</div>';
	$rd .= '</div>';
	$rd .= '</div>';
			
	if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$rd);	
 			
?>