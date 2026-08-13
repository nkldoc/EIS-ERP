<?php
	include("../../../conf/config.php");
	include("../../../lib/database/DatabaseServer.php");
	include("../../../lib/database/apiUtil.php");
	include("../../../lib/date/i_date.class.php");
        include("../../conf/configTax.php");
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
	
	function DesignExcelTemplate(){
		global $db,$util,$date,$arr_tax_group,$arr_tax_itype;	
		$con		= null;
		$i 			= 0; 
		$mode		= @$_REQUEST["mode"];
		$i_enable 	= @$_REQUEST["i_enable"];
		######################################
		
		$table	= "dc_tax";
		$title  = "รายงานภาษีหัก ณ ที่จ่าย";
		$root	= "data";
		$data	= array();
 
		################### ###################
				
		$arrParam[]	= 1;
		if($mode == "SEARCH") {
		
			if($i_enable > 0){
				$con	.= " AND a.i_enable = ?";
				$arrParam[]	= $i_enable;
			}
		} 

		$sqlTempTable = "select a.c_code , a.c_name, a.f_tax_rate as f_amount
                                        , CASE i_type_whtax	
                                                WHEN ".TAX_BY_RATE." THEN 'หักตามอัตราภาษี'
                                                WHEN ".TAX_BY_PROGRESS." THEN 'หักตามอัตราก้าวหน้า'
                                                WHEN ".TAX_BY_M48." THEN 'หักตามเกณฑ์มาตรา 48'
                                                WHEN ".TAX_BY_PENSION." THEN 'หัก ณ ที่จ่ายจากบำเหน็จ'
                                                WHEN ".TAX_BY_NONE." THEN 'ไม่หัก ณ ที่จ่าย'
                                                ELSE ''
                                          END as whtax_name
                                        , a.i_enable
                                        , isnull(b.c_code, '')+' '+isnull(b.c_name, '') as acc_name
                                    from {$table} a
                                    left join dc_acc b on a.dc_acc_id = b.dc_acc_id
                                    where 1 = ? ".$con;
		
		$stmt = $db->QueryParam($sqlTempTable, $arrParam);
		$i = 1; 
		
		$rd ='<table border="1">';
		$rd .= '<tr><td align="center" style="font-size:16px;" colspan="7">'.$title.'</td></tr>';
		//
		$rd .= '<tr><td align="left" style="font-weight:bold;" colspan="7">สถานะ : '.enable($_REQUEST['i_enable']).'</td></tr>';
		//
				$rd .= '<tr>
					<th> ลำดับ</th>
					<th> รหัส</th>
					<th> ชื่อรายการ</th>
					<th> อัตราภาษี(%)</th>
					<th> ประเภทการหักภาษี ณ ที่จ่าย</th>
					<th> ชนิดบัญชี</th>
					<th> สถานะ</th>
				</tr>';
		while($row =$db->Fetch($stmt))
		{
			$rd .= '<tr>
					<td>'.($i++).'</td>
					<td align="center">'. $row["c_code"].'</td>
					<td>'. $row["c_name"] .'</td>
					<td align="right">'. number_format($row['f_amount'],2) .'</td>
					<td>'. $row["whtax_name"] .'</td>
					<td>'. $row["acc_name"] .'</td> 
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