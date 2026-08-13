<?php 	
	//Center Config
	include("../../../conf/config.php"); 
	include("../../../lib/database/DatabaseServer.php");
	include("../../../lib/database/apiUtil.php");
	include("../../../lib/date/i_date.class.php");
	//Local config
	include("./../../conf/configAR.php");  
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
	//Pre
	$_REQUEST["dc_cost_id"] = ($_REQUEST["dc_cost_id"]=='')?-1:$_REQUEST["dc_cost_id"];
	$_REQUEST["dc_cnt_id"] = ($_REQUEST["dc_cnt_id"]=='')?-1:$_REQUEST["dc_cnt_id"];
	$_REQUEST["dc_product_type_id"] = ($_REQUEST["dc_product_type_id"]=='')?-1:$_REQUEST["dc_product_type_id"];
		//iSearch&date  
	$c_yyyy_mm= sprintf("%04d%02d",$_REQUEST['c_yyyy'],$_REQUEST['c_mm']);  
	$con	.= " b.c_yyyy_mm =? ";
	$arrParam[]	= $c_yyyy_mm;
	
	  
	if($_REQUEST["dc_cnt_id"]!='-1'){
		$con	.= " AND b.dc_cnt_id = ?";  
		$arrParam[]	= $_REQUEST["dc_cnt_id"];  
		$txtCnt = $_REQUEST["txtdc_cnt_idID"];
	}else{
		$txtCnt ='ทั้งหมด';
	}
	
	if($_REQUEST["dc_cost_id"]!='-1'){
		$con	.= " AND o.dc_cost_id = ?";  
		$arrParam[]	= $_REQUEST["dc_cost_id"];  
		$txtCost = $_REQUEST["txtdc_cost_idID"];
	}else{
		$txtCost ='ทั้งหมด';
	}  
	
	if($_REQUEST["dc_product_type_id"]!='-1'){
		$con	.= " AND b.dc_product_type_id = ?";  
		$arrParam[]	= $_REQUEST["dc_product_type_id"]; 
		$txtProType = $_REQUEST["txtdc_product_type_idID"];
	}else{
		$txtProType ='ทั้งหมด';
	} 

	$sqlMain = "select b.ar_bill_invoice_hdr_id
		, b.c_area_print
		, b.dc_product_type_id 
		, b.dc_cnt_id
                , (select top 1 c_name_inv from dc_cnt where dc_cnt_id=b.dc_cnt_id) as c_name_inv
                , (select top 1 ar_pre_print_bill_hdr_id from ar_pre_print_bill_hdr where ar_bill_invoice_hdr_id=b.ar_bill_invoice_hdr_id) as ar_pre_print_bill_hdr_id
		, b.c_yyyy_mm 
                , convert(varchar, b.d_billing_date, 120) as d_billing_date
                
                , o.dc_cost_id
		, o.c_name
			from ar_so_hdr a  
			inner join ar_bill_invoice_hdr b on a.ar_so_hdr_id=b.ar_so_hdr_id
			inner join dc_cost o on o.dc_cost_id=a.dc_cost_id
			where {$con} and b.i_no_order='1' 
					and isnull(b.i_parent,0) =0
					and isnull(b.c_area_print,'0') !='0' 
					and isnull(a.i_is_status,0) !=1 
					and isnull(b.i_enable,2)=1
					and isnull(b.i_is_invoice,0)=1 
		order by a.dc_cost_id,b.dc_product_type_id
		";  
 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	//html
	$stTbl 		= ' style="border: 1px solid black; background-color: #ccc; font-size:12px; width:100%;  "';
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
		$rd .= '<tr><td '.$stTitle.' align="left" colspan="14">';
		// Condition 
			$rd .= '<h2 align="center">'.$_REQUEST['titleReport'].'</h2>'; 	 
			$rd .='<p style="color:green; text-indent:15cm; text-align:justify;">';
			$rd .= '<br/>หน่วยงาน  :  '.$txtCost;
			$rd .= '<br/>ประเภทรายได้ :  '.$txtProType; 
			$rd .= '<br/>ชื่อลูกค้า  : '.$txtCnt; 
			$rd .='</p>';
		$rd .= '</td></tr>';
		// column
		
	$f_total_amount = 0;
	$cnt_id = 0;

// Head
			$rd .= '<tr>
				<th '.$stTh.'>ลำดับ</th>
				<th '.$stTh.'> ชื่อลูกค้า</th>
				<th '.$stTh.'> เลขที่ใบแจ้งหนี้</th> 
				<th '.$stTh.'> วันที่แจ้งหนี้</th>
				<th '.$stTh.'> เดือน/ปี ที่วางบิล</th>
				<th '.$stTh.'> รายการ </th> 
				<th '.$stTh.'> จำนวนเงินหลังหักส่วนลดการค้า</th>
				<th '.$stTh.'> ส่วนลดล่วงหน้า/ส่วนลดเงินสด</th>
				<th '.$stTh.'> จำนวนเงินสุทธิ</th> 
				<th '.$stTh.'> ภาษีมูลค่าเพิ่ม</th>
				<th '.$stTh.'> จำนวนเงินรวมภาษีมูลค่าเพิ่ม</th>  
			</tr>';	
	$i = 0;		
	while($row =$db->Fetch($stmt))				
	{
            $c_yyyy_mm = $row["c_yyyy_mm"]?(@$date->l_month_thai[substr($row["c_yyyy_mm"],4,2)]." ".(floatval(substr($row["c_yyyy_mm"],0,4))+543)):null;           
            $c_invoice_item = $db->GetDataBySQL("select top 1 c_invoice_item from ar_pre_print_bill_dtl where i_is_detail=1 and ar_pre_print_bill_hdr_id=?", array($row["ar_pre_print_bill_hdr_id"]));
                                                                        
            $i++; 
            $rd .= '<tr>
                            <td nowrap '.$stTd.'> '.$i.'</td>
                            <td '.$stTd.'> '.$row["c_name_inv"].' </td> 
                            <td nowrap '.$stTd.'> '.$row["c_area_print"].' </td>
                            <td nowrap '.$stTd.'> '.$date->extDateBuddha($row["d_billing_date"]).' </td> 
                            <td nowrap '.$stTd.'> '.$c_yyyy_mm.'</td> 
                            <td '.$stTd.'> '.$c_invoice_item.'</td>
                            <td '.$stTd.'> </td>
                            <td '.$stTd.' align="right"> </td>  
                            <td '.$stTd.'>  </td>
                            <td '.$stTd.'>  </td>
                            <td nowrap '.$stTd.'>  </td> 
                    </tr>';	
	
	$f_total_amount += 0;	
	}
	
  	/* $rd .= '<tr class="footer-report">
					<td colspan="8" align="right"> <span class="underline">รวมทั้งหมด </span></td>
					<td align="right">'.number_format($f_total_amount,2).'</td>
					<td colspan="5">&nbsp;</td>
			</tr>';	  */
	$rd .= '</div>';
	$rd .= '</div>';
	$rd .= '</div>';
			
	if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$rd);	
 			
?>