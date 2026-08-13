<?php
	include("../../../conf/config.php");
	include("../../../lib/database/DatabaseServer.php");
	include("../../../lib/database/apiUtil.php");
	include("../../../lib/date/i_date.class.php");
 
	###################
	$db 	= new DatabaseServer();
	$date 	= new i_date();
	$util	= new apiUtil();
 

	function enable($a){
		if($a == STATUS_ENABLE){
			return "ใช้งาน";
		}else if($a == STATUS_DISABLE){
			return  "ไม่ใช้งาน";
		}else{
			return  "เลือกทั้งหมด"; }
	}
	
	function show($a){
		if($a == STATUS_ENABLE){
			return "แสดง";
		}else if($a == STATUS_DISABLE){
			return  "ไม่แสดง";
		}else{
			return  "เลือกทั้งหมด"; }
	}
	
	function DesignExcelTemplate(){
		global $db,$util,$date;	
		$con		= null;
		$i 			= 0; 
		$mode		= @$_REQUEST["mode"];
		$i_enable 	= @$_REQUEST["i_enable"];
		######################################
		
		$table	= "dc_vat";
		$title  = "รายงานภาษีมูลค่าเพิ่ม";
		$root	= "data";
		$data	= array();
 
		################### ###################
				
		$arrParam[]	= 1;
		if($mode == "SEARCH") {
			if($i_enable > 0){
				$con	.= " AND i_enable = ?";
				$arrParam[]	= $i_enable;
			}
		} 

		$sqlTempTable = "SELECT c_code
                                    ,c_name
                                    ,(select top 1 c_code+' '+c_name from dc_acc where dc_acc_id={$table}.dc_acc_id) as dc_acc_sale_name
                                    ,(select top 1 c_code+' '+c_name from dc_acc where dc_acc_id={$table}.dc_acc_income_id) as dc_acc_income
                                    ,f_vat_rate
                                    ,i_enable
                                FROM {$table} 
                                where 1 = ? ".$con
                            ."	ORDER BY c_code";
		
		$stmt = $db->QueryParam($sqlTempTable, $arrParam);
		$i = 1; 
		
		$rd ='<table border="1">';
		$rd .= '<tr><td align="center" style="font-size:16px;" colspan="7">'.$title.'</td></tr>';
		$rd .= '<tr><td align="left" style="font-weight:bold;" colspan="7">สถานะ : '.enable($_REQUEST['i_enable']).'</td></tr>';
		$rd .= '<tr>
					<th> ลำดับ</th>
					<th> รหัส</th>
					<th> ชื่อรายการ</th>
					<th> อัตราภาษี(%)</th>
					<th> บัญชีภาษีขาย</th>
					<th> บัญชีภาษีซื้อยังไม่ถึงกำหนด</th>
					<th> สถานะ</th>
				</tr>';
		while($row =$db->Fetch($stmt))
		{
			$rd .= '<tr>
					<td>'.($i++).'</td>
					<td align="center">'. $row["c_code"].'</td>
					<td>'. $row["c_name"] .'</td>
					<td align="right">'. number_format($row['f_vat_rate'],2) .'</td>
					<td>'. $row["dc_acc_sale_name"] .'</td>
					<td>'. $row["dc_acc_income"] .'</td> 
					<td>'. enable($row["i_enable"]) .'</td>
				</tr>';
		
		} // loop
		$rd .='</table>'; 

		header("Content-Type: application/octet-stream");
		header("Content-Transfer-Encoding: binary");
		header('Expires: '.gmdate('D, d M Y H:i:s').' GMT');
		header('Content-Disposition: attachment; filename = "'.$title.' '.date("Y-m-d").'.xls"');
		header('Pragma: no-cache'); 
		echo chr(255).chr(254).iconv("UTF-8", "UTF-16LE//IGNORE", $rd); 
	}  //end func
 
	DesignExcelTemplate(); //

?>