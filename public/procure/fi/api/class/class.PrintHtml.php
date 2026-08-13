<?php //global function
class PrintHtml
{
 
	public function __construct($db,$date,$mon) {
				$this->db 	= $db;
				$this->date = $date; 
				$this->mon = $mon; 
				$this->msg = null; 
				$this->logo = 'logo-null.jpg';
	}
	
	public function Html($id,$c_code,$arrDtl){
		global $db,$date,$mon; 
		$html 		= null;
		$itms 		= null;
		$head 		= null;
		$company 	= CUSTOMER_NAME_TH;
		// 
		$sql = "select a.*
				, isnull((select top 1 c_code from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id),'-') as so_code
				, (select top 1 c_code from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as inv_code
				, (select top 1 c_name_inv from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as c_name_inv
				, (select top 1 c_address_inv from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as c_address_inv
				
				, convert(varchar, a.d_doc_date, 120) as d_doc_date
				from fi_receive_tran_hdr a where a.fi_receive_tran_hdr_id=?"; 
				
		$row = $db->GetDataBySQL($sql,array($id));
		$dateBill = $date->long_date_from_db($row['d_doc_date']);
	 
	 
		$itmsx = null;
		$c_invoice_item1 = null;
		$c_invoice_item2 = null;

		foreach($arrDtl["detail"] as $f2){ 
		 $f1 = (array)$f2;
		 
			if($f1['i_detail']==0 || $f1['i_detail']==-1){
		//ยอดรวม	 
					if($f1['i_detail']==-1){ 
			//textBath
						$itmsx .= " <tr> 
										<td colspan='5' class='total-value'><div id='subtotal' align='right'>".@$f1['f_total_cost']."</div></td>
									</tr>";
					}else{
			//Float
						$itmsx .= " <tr>
								  <td colspan='2' class='blank'> </td>
								  <td colspan='2' class='total-line'>".@$f1['c_invoice_item']."</td>
								  <td class='total-value'><div id='subtotal'>".@number_format($f1['f_total_cost'],2)."</div></td>
							  </tr>";
					} 	  
			}else if($f1['i_detail']==1){
		//items
				$itmsx .= "<tr class='item-row'>
							  <td class='item-name'><div class='delete-wpr'><textarea>".@$f1['c_invoice_item']."</textarea><a class='delete' href='javascript:;' title='Remove row'>X</a></div></td>
							  <td class='description'><textarea>".@$f1['c_comment']."</textarea></td>
							  <td><textarea class='cost'>".@$f1['f_unit_cost']."</textarea></td>
							  <td><textarea class='qty'>".@$f1['f_quan']."</textarea></td>
							  <td><span class='price'>".@number_format($f1['f_total_cost'],2)."</span></td>
						  </tr>";
			}else if($f1['i_detail']==-2){
		//condition	
			$c_invoice_item1 = @$f1['c_invoice_item'];
	 
			}else if($f1['i_detail']==-3){
		//remark	
			$c_invoice_item2 = @$f1['c_invoice_item']; 
			}				  
		}
		$ownnerName = CUSTOMER_NAME_TH;
		$ownnerAddress = " 131/6 ถนนขาว แขวงวชิรพยาบาล เขตดุสิต กรุงเทพมหานคร 10300";
		$taxID = "1234567891234";
		$css = "<style type='text/css'> 
					* { margin: 0; padding: 0; }
					body { font: 14px/1.4 Georgia, serif; }
					#page-wrap { width: 800px; margin: 0 auto; } 
					textarea { border: 0; font: 14px Georgia, Serif; overflow: hidden; resize: none; }
					
					table { border-collapse: collapse; }
					table td, table th { border: 1px solid black; padding: 5px; } 
				 
					#header { height: 25px; width: 100%; margin: 20px 0; background: #000; text-align: center; color: white; font: bold 15px Helvetica, Sans-Serif; text-decoration: uppercase; letter-spacing: 20px; padding: 4px 0px; }
					#address { width: 250px; height:50px; float: left;  text-align:left;  }
					#customer { overflow: hidden; } 
					#ownner { overflow: hidden; } 
 					#ownner-address { text-align:left; float: left; position: relative;  max-width:640px; max-height:300px;   }
 
					#customer-title { font-size: 20px; font-weight: bold; float: left; } 
					#ownner-title { font-size: 20px; font-weight: bold; float: left; } 
					#meta { margin-top: 1px; width: 300px; float: right; }
					#meta td { text-align: right;  }
					#meta td.meta-head { text-align: left; background: #eee; }
					#meta td textarea { width: 100%; height: 20px; text-align: right; } 
					#items { clear: both; width: 100%; margin:2px 0 0 0; border: 1px solid black; }
					#items th { background: #eee; }
					#items textarea { width: 80px; height: 35px; font-size:12px; }
					#items tr.item-row td { border: 0; vertical-align: top; }
					#items td.description { width: 300px; }
					#items td.item-name { width: 175px; }
					#items td.description textarea, #items td.item-name textarea { width: 100%; }
					#items td.total-line { border-right: 0; text-align: right; }
					#items td.total-value { border-left: 0; padding: 10px; }
					#items td.total-value textarea { height: 20px; background: none; }
					#items td.balance { background: #eee; }
					#items td.blank { border: 0; } 
					#terms { text-align: center; margin: 20px 0 0 0; }
					#terms h5 { text-transform: uppercase; font: 13px Helvetica, Sans-Serif; letter-spacing: 10px; border-bottom: 1px solid black; padding: 0 0 8px 0; margin: 0 0 8px 0; }
					#terms textarea { width: 100%; text-align: center;} 
					textarea:hover, textarea:focus, #items td.total-value textarea:hover, #items td.total-value textarea:focus, .delete:hover { background-color:#EEFF88; }
					.delete-wpr { position: relative; }
					.delete { display: block; color: #000; text-decoration: none; position: absolute; background: #EEEEEE; font-weight: bold; padding: 0px 3px; border: 1px solid; top: -6px; left: -22px; font-family: Verdana; font-size: 12px; }				 
					 #hiderow, .delete {
					  display: none;
					}
					.rowTd{ overflow:hidden;}
					.rowTd .TdLeft{ float:left;}
					.rowTd .tdRight{ float:right;}
					#taxOwnner{ font-wight:bold;}
					#taxOwnner span{ height: 25px; width: 100%; text-align: center; color: black; font: bold 12px Helvetica, Sans-Serif; text-decoration: uppercase; letter-spacing:10px; padding: 2px 0px; }
					#remark{ width:100%; float:left; text-align:left; border-bottom:1px solid #000;}
			 </style>"; 
			 
	$html = "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
	<html xmlns='http://www.w3.org/1999/xhtml'> 
	<head>
		<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> 
		<title>Invoice</title> 
		{$css}
	</head> 
	<body>  
		<div id='page-wrap'> 
		<div class='rowTd'><textarea id='header'>RECEIPT (ใบเสร็จรับเงิน)</textarea> </div>	
		<div class='rowTd'>
			<div class='TdLeft'>
				<div id='identity'>  
						<textarea id='ownner-title'> {$ownnerName}</textarea>
						
					<div style='clear:both'></div> 	 
						<div id='ownner-address'> {$ownnerAddress}</div>
				 
					<div style='clear:both'></div> 
					<textarea id='customer-title'> {$row['c_name_inv']}</textarea>  
				</div> 
				<div style='clear:both'></div>  
				<div id='customer'> 
					<textarea id='address'>{$row['c_address_inv']}</textarea> 
				</div>
			</div>
			<div class='tdRight'>
					<div id='taxOwnner'>เลขประจำตัวผู้เสียภาษี  <span>{$taxID}</span></div>
					<table id='meta'>
						<tr>
							<td class='meta-head'>No #</td>
							<td><div class='due'>{$c_code}</div></td>
						</tr> 
						<tr>
							<td class='meta-head'>Invoice #</td>
							<td><textarea>{$row['inv_code']}</textarea></td>
						</tr>					
						<tr>
							<td class='meta-head'>Order #</td>
							<td><div class='due'>{$row['so_code']}</div></td>
						</tr>  
						<tr> 
							<td class='meta-head'>Date</td>
							<td><textarea id='date'>{$dateBill}</textarea></td>
						</tr> 
					</table> 
				</div>
			</div> 
			<div class='rowTd'>
						<table id='items'> 
						  <tr>
							  <th>รายการ</th>
							  <th>คำอธิบาย</th>
							  <th>ราคา/หน่วย</th>
							  <th>จำนวน</th>
							  <th>ราคารวม</th>
						  </tr>
						  {$itmsx} 
						</table> 
						<div id='terms'>
						  <!--<h5></h5>-->
						  <div id='remark'>{$c_invoice_item2}</div>
						  <textarea>".@$c_invoice_item1."</textarea>
						</div> 
			 </div>	 
		</div> 
	</body> 
	</html>"; 
		return $html; // before get htmlspecialchars_decode($html);  
	}
 
    function __destruct(){}
}


?>