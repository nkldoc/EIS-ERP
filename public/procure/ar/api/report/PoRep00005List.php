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
	
	$con	.= " isnull(c.dc_cnt_id,0)!=0 AND d.d_doc_date between ? AND ?";
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
							, b.c_name 
							, b.ap_period_hdr_id
							, c.c_name as c_cnt_name
							, c.c_address
							, c.c_mobile
							, c.c_telephone
							
							, d.c_comment
							, isnull(d.f_amount,0) as f_amount
							, convert(varchar, d.d_doc_date, 120) as d_doc_date
							
							, isnull(b.f_net_cost,0) as f_total_amount
							, isnull(b.i_seq,0) as i_seq
							, isnull(b.i_is_delivery,0) as i_is_delivery
							, isnull(b.i_is_audit,0) as i_is_audit
							
							, (select sum(f_quan) from ap_period_dtl where i_enable = 1 and ap_period_hdr_id = b.ap_period_hdr_id) as f_quan
							, (select sum(f_unit_cost) from ap_period_dtl where i_enable = 1 and ap_period_hdr_id =b.ap_period_hdr_id) as f_unit_cost
							
							, (select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_cost_id) as dc_cost_name 
							, (select top 1 c_full_name from dc_user where dc_user_id=d.dc_user_create_id) as c_create_name 
							, (select top 1 c_full_name from dc_user where dc_user_id=d.dc_user_update_id) as c_update_name
							  
					, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row		
				FROM {$table} 
					INNER JOIN ap_period_hdr b ON {$table}.ap_po_hdr_id = b.ap_po_hdr_id
					INNER JOIN dc_cnt c ON {$table}.dc_cnt_id = c.dc_cnt_id
					INNER JOIN ap_fine d ON d.ap_period_hdr_id = b.ap_period_hdr_id 					
					
				WHERE {$con}
				GROUP BY {$table}.ap_po_hdr_id
							, {$table}.c_po_no 
							, b.c_name
							, b.ap_period_hdr_id
							, b.d_period_date							
							, c.c_name 
							, c.c_address
							, d.c_comment
							, d.f_amount
							, d.d_doc_date
							, c.c_mobile
							, c.c_telephone
							, b.f_net_cost
							, b.i_seq
							, b.i_is_delivery
							, b.i_is_audit
							,{$table}.dc_cnt_id
							,{$table}.dc_cost_id
							
							,{$table}.c_doc_resp_no
							,{$table}.c_contract_no
							,{$table}.i_is_purchase
							,{$table}.i_is_success
							,d.dc_user_create_id 
							,d.dc_user_update_id 
				 
				";   
 
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a ";  
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	//html
	$stTbl 		= ' style="border: 1px solid black; background-color: #ccc; font-size:12px; width:100%;  "';
	$stHeader	= ' nowrap style="background-color: #eee; text-align:center; font-weight:bold;"';
	$stTitle 	= ' nowrap style="background-color: #eee; text-align:left; font-weight:bold;"';
	$stTh 		= ' nowrap style="background-color: #eee; text-align:center;"';
	$stTd 		= ' style="background-color: #fff;"';
	
	
	
	
	$rd = '';
	$rd .='<div class="book">';
	$rd .='<div class="page">';
	$rd .='<div class="subpage">';

		$rd ='<table '.$stTbl.'>'; 
	  		
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
	function showLoop($th,$td=true){ //print_r($th);
		 global $stTh;
		
				$rd = '<tr>'; 
					foreach ($th as $value) { 
						$rd .= '<th '.$stTh.'>'.$value.'</th>'; 
					} 
				$rd .= '</tr>';
				return $rd;
		
		}	
	 
	$th = array('ลำดับ','วันที่บันทึกการปรับ','เลขที่ใบจัดซื้อ/จัดจ้าง','เรื่อง','หน่วยงานที่จัดซื้อ','จำนวนเงินค่าปรับ','ผู้สร้างรายการ','ผู้แก้ไขรายการ','หมายเหตุ');
	//echo  showLoop($th);
	$i=0;
	$f_total_amount1 = 0;
	$f_total_amount2 = 0;
	while($row =$db->Fetch($stmt))				
	{
 
		
		
		if($cnt_id!=$row['dc_cnt_id']){
			
		 
			
		 $cnt = 'เลือกผู้ขาย/ผู้รับจ้าง  :: '.$row['c_cnt_name'].'<br/>';
		 $cnt .= 'ที่อยูู่  ::  '.$row['c_address'].'<br/>';
		 $cnt .= 'เบอร์โทร  ::  '.$row['c_telephone'].'&nbsp;';
		 $cnt .= 'มือถือ  ::  '.$row['c_mobile'].'<br/>';
  
  
			if($f_total_amount2 >0 && $i>0){
				$rd .= '<tr class="footer-report">
						<td colspan="5" align="right"> <span class="underline">รวม </span></td>
						<td align="right">'.number_format($f_total_amount1,2).'</td>
						<td colspan="3">&nbsp;</td>
				</tr>';	
				$f_total_amount1 = 0;
			}
			
		  	$rd .= '<tr id="header">
						<td '.$stTd.' colspan="9">'.$cnt.'</td> 
					</tr>';	  
			$rd .= showLoop($th); //th
			
			
			$cnt_id = $row['dc_cnt_id'];
			$i=0;
			
		}	//group cnt
		$i++; 
			
			
			$rd .= '<tr>
					<td '.$stTd.' align="center"><a href="./getPoDetail.php?id='.$row["ap_po_hdr_id"].'" target="_Blank">'.$i.'</a></td>
					<td '.$stTd.' align="center"> '.$date->extDateBuddha($row["d_doc_date"]).'</td>
					<td '.$stTd.' align="right"> '.$row["c_po_no"].'</td>
					<td '.$stTd.'> '
					.$row["c_name"]
					.'<div style="padding-left:10px;">เลขที่สััญญา'.$row["c_contract_no"].'</div>'
					.'<div style="padding-left:10px;">งวดที่ '.$row["i_seq"].'</div>'
					.'</td>  
					<td '.$stTd.'> '.$row["dc_cost_name"].'</td>					
					<td '.$stTd.' align="right"> '.number_format($row["f_amount"],2).'</td>  
					<td '.$stTd.'> '.$row["c_update_name"].'</td>
					<td '.$stTd.'> '.$row["c_create_name"].'</td> 
					<td '.$stTd.'> '.$row["c_comment"].'</td>
				</tr>';

					
	$f_total_amount1 += $row["f_total_amount"];	
	$f_total_amount2 += $row["f_total_amount"];	
	} //loop
	$rd .= '<tr class="footer-report">
						<td colspan="5" align="right"> <span class="underline">รวม</span></td>
						<td align="right">'.number_format($f_total_amount1,2).'</td>
						<td colspan="3">&nbsp;</td>
				</tr>';	
  	$rd .= '<tr class="footer-report">
					<td colspan="5" align="right"> <span class="underline">รวมทั้งหมด </span></td>
					<td align="right">'.number_format($f_total_amount2,2).'</td>
					<td colspan="3">&nbsp;</td>
			</tr>';	 
	$rd .= '</div>';
	$rd .= '</div>';
	$rd .= '</div>';
			
	if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$rd);	
 			
?>