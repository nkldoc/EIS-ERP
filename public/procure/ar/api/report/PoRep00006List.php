<?php include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php"); 
	function List_QueryParam() {
	
	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy;

	$totalCount		= 0;
	$con1			= null;
	$con2			= null;
	$con3			= null;

	// ========================================================================================== //

	$dc_acc_id	= explode(";", $_REQUEST["dc_acc_id"]); 
		$in_acc	= "";
		foreach( $dc_acc_id as $val ) { 
			if($val!="0")
			$in_acc	.= ( $in_acc == "" )? $val : ", ".$val; 
		}
		$con2	.= " AND b.dc_acc_id IN (".$in_acc.")";
		$con3	.= " AND a.dc_acc_id IN (".$in_acc.")";
 
	$dc_cost_id	= explode(";", $_REQUEST["dc_cost_id"]);
	if( !in_array( "0", $dc_cost_id ) ) {
		$in_cost	= "";
		foreach( $dc_cost_id as $val ) { $in_cost	.= ( $in_cost == "" )? $val : ", ".$val; }
		$con1	.= " AND aa.dc_cost_acc_id IN (".$in_cost.")";
		$con2	.= " AND b.dc_cost_acc_id IN (".$in_cost.")";
	}
 
	$sqlMain	= "	DECLARE @mm_s INT = ?;
					DECLARE @mm_e INT = ?;
					DECLARE @yyyy_s INT = ?;
					DECLARE @yyyy_e INT = ?;

					SET NOCOUNT ON
					SELECT
						b.dc_acc_id
						,a.gl_tran_hdr_id
						,a.c_ref_doc
						,a.d_doc_date
						,a.c_code
						,a.c_code_post
						,a.d_save_date
						,b.i_rank
						,a.c_comment1+' '+a.c_comment2+' '+a.c_comment3 AS c_name
						,b.dc_product_id
						,(SELECT c_name FROM dc_product WHERE dc_product_id=b.dc_product_id) AS product_name
						,b.dc_cost_acc_id
						,(SELECT c_name FROM dc_cost WHERE dc_cost_id=b.dc_cost_acc_id) AS cost_name
						,b.dc_channel_id
						,(SELECT c_name FROM dc_channel WHERE dc_channel_id=b.dc_channel_id) AS channel_name
						,(SELECT aa.i_debit FROM dc_acc aa WHERE aa.dc_acc_id=b.dc_acc_id) AS i_debit
						,(	SELECT SUM(CASE WHEN (bb.i_debit=1) THEN aa.f_end_dr-aa.f_end_cr ELSE aa.f_end_cr-aa.f_end_dr END)
							FROM gl_balance_cost aa
								INNER JOIN dc_acc bb ON aa.dc_acc_id=bb.dc_acc_id
							WHERE aa.i_is_close_year=2 AND aa.i_is_post IN (2, 3)
								AND aa.dc_acc_id=b.dc_acc_id
								AND aa.c_mm=(CASE WHEN 1=@mm_s THEN 12 ELSE @mm_s-1 END)
								AND aa.c_yyyy=(CASE WHEN 1=@mm_s THEN @yyyy_s-1 ELSE @yyyy_s END)
								{$con1}
						) AS f_balance
						,b.f_dr
						,b.f_cr
						,(SELECT bb.c_name FROM dc_emp bb WHERE bb.dc_emp_id=(SELECT aa.dc_emp_id FROM dc_user aa WHERE aa.dc_user_id=a.dc_user_create_id)) AS emp_name
						,b.i_is_nontax_exp
					INTO #temData
					FROM gl_tran_hdr a
							INNER JOIN gl_tran_dtl b ON a.gl_tran_hdr_id=b.gl_tran_hdr_id
							INNER JOIN dc_acc c ON b.dc_acc_id=c.dc_acc_id
					WHERE a.i_is_post in ( 2 , 3 ) AND a.i_is_close_year=2 AND a.i_enable=1
						AND c.i_last=1 AND c.i_enable=1 AND c.i_delete=2
						AND a.c_yyyy_mm	BETWEEN (CAST(@yyyy_s AS varchar(4))+CAST(RIGHT('0'+CAST(@mm_s AS varchar(2)),2) AS varchar(2)))
							AND (CAST(@yyyy_e AS varchar(4))+CAST(RIGHT('0'+CAST(@mm_e AS varchar(2)),2) AS varchar(2)))
						{$con2}
					
					SELECT
						a.dc_acc_id
						,a.c_code AS acc_code
						,a.c_name AS acc_name
						,b.gl_tran_hdr_id
						,b.c_ref_doc
						,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
						,b.c_code
						,b.c_code_post
						,CONVERT(VARCHAR, b.d_save_date, 120) AS d_save_date
						,b.i_rank
						,b.c_name
						,b.dc_product_id
						,b.product_name
						,b.dc_cost_acc_id
						,b.cost_name
						,b.dc_channel_id
						,b.channel_name
						,b.i_debit
						,ISNULL(b.f_balance,0) AS f_balance
						,b.f_dr
						,b.f_cr
						,b.emp_name
						,b.i_is_nontax_exp
					FROM dc_acc a
						LEFT JOIN #temData b ON a.dc_acc_id=b.dc_acc_id
					WHERE a.i_last=1 AND a.i_enable=1 AND a.i_delete=2
						{$con3}
					ORDER BY a.c_code_tree, b.d_save_date, b.c_ref_doc, b.i_rank";

	$arrParam[]	= sprintf( "%02d", $_REQUEST['month_s']);
	$arrParam[]	= sprintf( "%02d", $_REQUEST['month_e']);
	$arrParam[]	= $_REQUEST["year_s"];
	$arrParam[]	= $_REQUEST["year_e"];
	
	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	if( $stmt ) {
		while( $row = $db->Fetch( $stmt ) ) {
	
			$GroupArr[$row["dc_acc_id"]]["acc_code"]	= $row["acc_code"];
			$GroupArr[$row["dc_acc_id"]]["acc_name"]	= $row["acc_name"];
			$GroupArr[$row["dc_acc_id"]]["i_debit"]		= $row["i_debit"];
			$GroupArr[$row["dc_acc_id"]]["f_balance"]	= $row["f_balance"];
			
			if( $row["gl_tran_hdr_id"] > 0 ) {
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["c_ref_doc"]			= $row["c_ref_doc"]; 
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["d_doc_date"]			= $date->shot_date_from_db($row["d_doc_date"]);
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["c_code"]				= $row["c_code"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["c_code_post"]			= $row["c_code_post"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["d_save_date"]			= $date->shot_date_from_db($row["d_save_date"]);
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["i_rank"]				= $row["i_rank"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["c_name"]				= $row["c_name"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["dc_product_id"]		= $row["dc_product_id"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["product_name"]			= $row["product_name"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["dc_cost_acc_id"]		= $row["dc_cost_acc_id"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["cost_name"]			= $row["cost_name"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["dc_channel_id"]		= $row["dc_channel_id"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["channel_name"]			= $row["channel_name"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["i_debit"]				= $row["i_debit"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["f_balance"]			= $row["f_balance"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["f_dr"]					= $row["f_dr"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["f_cr"]					= $row["f_cr"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["emp_name"]				= $row["emp_name"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]]["i_is_nontax_exp"]		= $row["i_is_nontax_exp"];
			}

			$totalCount++;
		}
		
		$channel		= array();
		$sum_f_dr		= 0;
		$sum_f_cr		= 0;
		$sum_f_balance	= 0;
		
		foreach( $GroupArr AS $dc_acc_id => $objAcc ) {
			
			//=================================//
			$temp		= array();
			
			$no			= 0;
			$f_dr		= 0;
			$f_cr		= 0;
			
			$temp["i_type"]				= 1;
			$temp["c_name"]				= "รหัสบัญชี : ".$objAcc["acc_code"]." ชื่อบัญชี : ".$objAcc["acc_name"];
			$temp["f_balance"]			= $objAcc["f_balance"];
			
			${$root}[]	= $temp;
			//=================================//
			if(!is_null(@$TranArr[$dc_acc_id])) {
				
				$balance	= ($objAcc["f_balance"] > 0)? $objAcc["f_balance"] : 0; // ยอดคงเหลือ
				foreach( $TranArr[$dc_acc_id] AS $gl_tran_hdr_id => $objTran ) {
				
					//=================================//
					$temp		= array();
						
					$temp["i_type"]				= 2;
					$temp["no"]					= ++$no;
					$temp["c_ref_doc"]			= $objTran["c_ref_doc"];
					$temp["d_doc_date"]			= $objTran["d_doc_date"];
					$temp["c_code"]				= $objTran["c_code"];
					$temp["c_code_post"]		= $objTran["c_code_post"];
					$temp["d_save_date"]		= $objTran["d_save_date"];
					$temp["i_rank"]				= $objTran["i_rank"];
					$temp["c_name"]				= $objTran["c_name"];
					$temp["dc_product_id"]		= $objTran["dc_product_id"];
					$temp["product_name"]		= $objTran["product_name"];
					$temp["dc_cost_acc_id"]		= $objTran["dc_cost_acc_id"];
					$temp["cost_name"]			= $objTran["cost_name"];
					$temp["dc_channel_id"]		= $objTran["dc_channel_id"];
					//$temp["channel_name"]		= $objTran["channel_name"];
					$temp["i_debit"]			= $objTran["i_debit"];
					$temp["f_dr"]				= $objTran["f_dr"];
					$temp["f_cr"]				= $objTran["f_cr"];
					$temp["f_balance"]			= ($balance+$objTran["f_dr"])-$objTran["f_cr"];
					$temp["emp_name"]			= $objTran["emp_name"];
					$temp["i_is_nontax_exp"]	= $objTran["i_is_nontax_exp"];
					
					$f_dr	+= $objTran["f_dr"];
					$f_cr	+= $objTran["f_cr"];
					$balance	= ($balance+$objTran["f_dr"])-$objTran["f_cr"];

					if( array_key_exists( $objTran["dc_channel_id"], $channel ) ) {
						$channel[$objTran["dc_channel_id"]]["f_dr"]	+= $objTran["f_dr"];
						$channel[$objTran["dc_channel_id"]]["f_cr"]	+= $objTran["f_cr"];
					} else {
						$channel[$objTran["dc_channel_id"]]["f_dr"]	= $objTran["f_dr"];
						$channel[$objTran["dc_channel_id"]]["f_cr"]	= $objTran["f_cr"];
					}
					$channel[$objTran["dc_channel_id"]]["channel_name"]		= $objTran["channel_name"];
					
					${$root}[]	= $temp;
					//=================================//
				
				}
				
			}

			//=================================//
			$temp		= array();
			$no			= 0;
				
			$temp["i_type"]				= 3;
			$temp["c_name"]				= "รวมรหัสบัญชี : ".$objAcc["acc_code"]." ชื่อบัญชี : ".$objAcc["acc_name"];
			$temp["f_dr"]				= $f_dr;
			$temp["f_cr"]				= $f_cr;
			$temp["f_balance"]			= $f_dr-$f_cr;

			$sum_f_dr		+= $f_dr;
			$sum_f_cr		+= $f_cr;
			$sum_f_balance	+= $f_dr-$f_cr;
			
			${$root}[]	= $temp;
			//=================================//
		}
		
		//=================================//
		/* foreach( $channel AS $dc_cost_id => $objCha ) {
			$temp		= array();
			
			$temp["i_type"]				= 4;
			$temp["c_name"]				= "รวม".$objCha["channel_name"];
			$temp["f_dr"]				= $objCha["f_dr"];
			$temp["f_cr"]				= $objCha["f_cr"];
			$temp["f_balance"]			= $objCha["f_dr"]-$objCha["f_cr"];
			
			${$root}[]	= $temp;
		} */
		//=================================//

		//=================================//
		$temp		= array();
	
		$temp["i_type"]				= 5;
		$temp["c_name"]				= "รวมทั้งสิ้น";
		$temp["f_dr"]				= $sum_f_dr;
		$temp["f_cr"]				= $sum_f_cr;
		$temp["f_balance"]			= $sum_f_balance;

		${$root}[]	= $temp;
		//=================================//
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
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
			tbody > tr:nth-child(even) { background: #FFF } tbody > tr:nth-child(odd) { background: #FCFCFC } </style>';
			echo $rd;
		}   
	}; //Function 
	###################
	$db 	= new DatabaseServer();
	$date 	= new i_date();
	$util	= new apiUtil();
 
	######################################

 
	$root		= "data";
	$data		= array();
	$con		= null;
	$select		= null;
	$flds		= null;
	$groupBy	= null;
 
	$_REQUEST["i_show"] = 2;
	$_REQUEST["i_is_nontax_exp"] = 1;
	

$arr_status = array("-1"=>"ทั้งหมด", "1"=>"ใช้งาน", "2"=>"ไม่ใช้งาน");
 
$s_title	= true;
$title		= "บริษัท อสมท จำกัด (มหาชน)"; 

$thead[]	= "ลำดับที่";
$thead[]	= "รหัส";
$thead[]	= "เงื่อนไขการชำระเงิน";
$thead[]	= "คำอธิบายเพิ่มเติม"; 
$thead[]	= "สถานะ";
  
//$data_dtl	= json_decode(List_QueryParam(), true);

$alias = 'http://'.$_SERVER['HTTP_HOST'].'/'.PROJECT; 
$url = $alias.'/ar/api/report/PoRep00006List.php?act=getDataUrl'; 
 
$datas = $db->getData($url);
print_r($datas);
exit;

	//=======================================// 
	$rd = null;
	$rd =  "<div align=\"center\"><strong>".$_REQUEST['titleReport']."</strong></div>";
	$rd .= "<div align=\"center\"><strong>สถานะ  : ".$arr_status[$_REQUEST["i_enable"]]."</strong></div>"; 
	
	//set Print Head new page
	$rd .=  '<table width="100%" class="table_report_buy" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">';
	$rd .=  '<thead valign="top">';
	$rd .=  '<tr bgcolor=\"#CCC\">';
		foreach ($thead as $value) {
			$rd .=  '<th class=\"top_bottom_small\">'.$value.'</th>';
		}
		$rd .=  '</tr>';
	 
	$rd .=  '</thead>';
	$rd .=  $tbody;
	$rd .=  '</table>'; 
	
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$rd);	
?>





 