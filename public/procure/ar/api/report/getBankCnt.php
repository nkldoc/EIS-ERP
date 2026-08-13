<?php include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php"); 
	function List_QueryParam() {
	
	global $db, $date, $util, $table, $root, $data, $sort,$dir,$i_read;
	
	$totalCount		= 0;
	$con			= null;
	$arrParam[] 	= DELETE_FALSE; 
 	#dc_cnt_id 
	$con		.= " AND {$table}.dc_cnt_id = ?";  
	$arrParam[]	= $_REQUEST["dc_cnt_id"];  
 
	 
	$sqlMain	= "select {$table}_id 
					,dc_bank_deposit_type_id
					,dc_bank_id
					,dc_bank_branch_id
					,dc_acc_id
					,dc_cost_id
					,dc_creditor_type_id
					,dc_cnt_id
					,dc_emp_id
					,dc_area_id
					,c_code
					,c_name 
					,dc_cost_old_id
					,i_main
					,i_trans_acc_tb
					,i_type 
					,i_delete
					,c_comment
					,i_enable
					,(select top 1 c_name from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as c_cnt_name 
					,(select top 1 c_name from dc_bank where dc_bank_id={$table}.dc_bank_id) as c_bank_name
					,(select top 1 c_name from dc_bank_branch where dc_bank_branch_id={$table}.dc_bank_branch_id) as c_branch_name
					,(select top 1 c_name from dc_bank_deposit_type where dc_bank_deposit_type_id={$table}.dc_bank_deposit_type_id) as 	c_bank_deposit_type_name				
					
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
						"id" 					=> $row["{$table}_id"],
						"c_code" 				=> $row["c_code"],
						"c_name" 				=> $row["c_name"], 
						"c_bank_name" 				=> $row["c_bank_name"], 
						"c_branch_name" 			=> $row["c_branch_name"], 
						"c_bank_deposit_type_name"	=> $row["c_bank_deposit_type_name"], 
						"c_comment"				=> $row["c_comment"],  
		
						"i_enable" 				=> $row["i_enable"],
						"i_delete" 				=> $row["i_delete"],
						"dc_user_create_id" 	=> $row["c_create_name"],
						"dc_user_create_cost_id" => $row["c_cost_creat_name"],
						"d_create" 				=> $date->extDateBuddha($row["d_create"]),
						"dc_user_update_id" 	=> $row["c_update_name"],
						"dc_user_update_cost_id" => $row["c_cost_update_name"],
						"d_update" 				=> $date->extDateBuddha($row["d_update"])
					);
			${$root}[] = $temp;
		}
 
	}

	return json_encode(array("debug"=>true, "totalCount"=>$i, $root=>${$root}));
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

	$table		= "dc_bank_acc";
	$dir 		= "ASC"; 
	$sort 		= "{$table}.c_code"; 
	$root		= "data";
	$data		= array();
 
 
	$arr_status = array("-1"=>"ทั้งหมด", "1"=>"ใช้งาน", "2"=>"ไม่ใช้งาน");
	
	$stTbl 		= ' style="border: 1px solid black; background-color: #ccc; font-size:12px; width:100%;  "';
	$stHeader	= ' nowrap style="background-color: #eee; text-align:center; font-weight:bold;"';
	$stTitle 	= ' nowrap style="background-color: #eee; text-align:left; font-weight:bold;"';
	$stTh 		= ' nowrap style="background-color: #eee; text-align:center;"';
	$stTd 		= ' style="background-color: #fff;"';
	
	$_REQUEST['titleReport'] = "รายงานเลขที่บัญชีเงินฝาก";
	$_REQUEST['mode'] = "html"; 
	$title		= "บริษัท อสมท จำกัด (มหาชน)";  
	$thead[]	= "ลำดับที่";
	$thead[]	= "เลขที่บัญชี";
	$thead[]	= "ชื่อบัญชี";
	$thead[]	= "ธนาคาร";   
	$thead[]	= "สาขา";
	$thead[]	= "ประเภทเงินฝาก";
	$thead[]	= "คำอธิบายเพิ่มเติม";
	$thead[]	= "สถานะ";
  
	$data_dtl	= json_decode(List_QueryParam(), true); 
	$tbody = null;
	
	if(is_array($data_dtl['data'])){
		foreach($data_dtl['data'] as $row)
		{ 
			$tbody .= '<tr><td align="center" '.$stTd.'> '.$row["no"].'</td>';
			$tbody .= '<td '.$stTd.'> '.$row["c_code"].'</td>'; 
			$tbody .= '<td '.$stTd.'> '.$row["c_name"].'</td>'; 
			$tbody .= '<td '.$stTd.'> '.$row["c_bank_name"].'</td>'; 
			$tbody .= '<td '.$stTd.'> '.$row["c_branch_name"].'</td>';  
			$tbody .= '<td '.$stTd.'> '.$row["c_bank_deposit_type_name"].'</td>'; 		
			$tbody .= '<td '.$stTd.'> '.$row["c_comment"].'</td>'; 
			$tbody .= '<td '.$stTd.'> '.$arr_status[$row["i_enable"]].'</td></tr>';
		}
	}
	//=======================================// 
	$rd = null;
	$rd =  "<div align=\"center\"><strong>".$title."</strong></div>";
	$rd .=  "<div align=\"center\"><strong>".$_REQUEST['titleReport']."</strong></div>";
	//$rd .= "<div align=\"left\"><strong>สถานะ  : ".$arr_status[$_REQUEST["i_enable"]]."</strong></div>"; 
	
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





 