<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/date/i_date.class.php");

//print_r($_REQUEST);
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
    if($ttt!=''){ //file include is not spacing outer tag php
        header("Content-Type: application/octet-stream");
        header("Content-Transfer-Encoding: binary");
        header('Expires: '.gmdate('D, d M Y H:i:s').' GMT');
        header('Content-Disposition: attachment; filename = "'.$title.' '.date("Y-m-d-H-i-s").'.'.$ttt.'"');
        header('Pragma: no-cache'); 
        echo chr(255).chr(254).iconv("UTF-8", "UTF-16LE//IGNORE", $rd);  
    }else{
        header('Content-Type: text/html; charset=utf-8');
        echo '<style type="text/css"> body{ padding:0px; margin:0px; } #footer td{ background-color:#fff;} </style>';
        echo $rd;
    }   
}; //Function

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
########################################################################## 

$ArrCheque	= array("0" => "เลือกทั้งหมด","1" => "เฉพาะเช็คที่มียอดค้างจ่าย", "2" => "เช็คที่จ่ายแล้ว");

//iSearch
$dc_bank_id = $_REQUEST["dc_bank_id"];
$dc_bank_acc_company_id = $_REQUEST["dc_bank_acc_company_id"];
$c_mm = $_REQUEST["c_mm"];
$c_yyyy = $_REQUEST["c_yyyy"];
$c_year_thai = $c_yyyy+543;
$c_yyyy_mm = $c_yyyy.$c_mm;

$fldOn	= ($_REQUEST["tableCheque"] == "cm_imp_cheque")? "a.d_doc_date" : "b.d_cheque";

$countH = 6;
//detail report
$sql = "SET NOCOUNT ON;
		declare @dc_bank_acc_company_id as bigint;
		declare @c_yyyy_mm as varchar(6);

		set @dc_bank_acc_company_id = ?;
		set @c_yyyy_mm = ?;

		declare @tb_report as table (cheque_no varchar(50)
									, d_cheque_date varchar(10)
									, c_name varchar(255)
									, f_cheque_amount decimal(18, 2)
									, d_bank_date varchar(10)
									, f_bank_amount decimal(18, 2)
									, i_type tinyint
									, c_code_cheque varchar(50)
									, c_code_bank varchar(50));
		/*รับเงินจากธนาคารข้ามเดือน*/
		insert into @tb_report
		select tb_cheque.cheque_no
			, tb_cheque.c_doc_date
			, tb_cheque.c_name
			, tb_cheque.f_cr
			, tb_bank.b_doc_date
			, tb_bank.f_amount
			, 1
			, tb_cheque.c_code
			, tb_bank.c_code
		from 
			(select convert(varchar(10), b.d_doc_date, 120) as b_doc_date
				, b.cheque_no
				, ABS(b.f_amount)  as f_amount
				, a.c_code
			from {$_REQUEST["tableBank"]}_hdr a
				inner join {$_REQUEST["tableBank"]}_dtl b on a.{$_REQUEST["tableBank"]}_hdr_id = b.{$_REQUEST["tableBank"]}_hdr_id
			where a.i_enable = 1 
				and b.i_cheque = 1
				and a.dc_bank_acc_company_id = @dc_bank_acc_company_id
				and cast(year(b.d_doc_date) as varchar(4)) + right('0'+cast(month(b.d_doc_date) as varchar(2)), 2) = @c_yyyy_mm) as tb_bank
		inner join 
			(select convert(varchar(10), {$fldOn}, 120) as c_doc_date
				, b.c_doc as cheque_no
				, b.c_name
				, b.f_cr
				, a.c_code
			from {$_REQUEST["tableCheque"]}_hdr a
				inner join {$_REQUEST["tableCheque"]}_dtl b on a.{$_REQUEST["tableCheque"]}_hdr_id = b.{$_REQUEST["tableCheque"]}_hdr_id
			where a.i_enable = 1 
				and b.f_cr > 0
				and a.dc_bank_acc_company_id = @dc_bank_acc_company_id
				and cast(year({$fldOn}) as varchar(4)) + right('0'+cast(month({$fldOn}) as varchar(2)), 2) < @c_yyyy_mm) as tb_cheque
		on tb_bank.cheque_no = tb_cheque.cheque_no;

		/*รับเงินจากธนาคารในเดือน*/
		insert into @tb_report
		select tb_cheque.cheque_no
			, tb_cheque.c_doc_date
			, tb_cheque.c_name
			, tb_cheque.f_cr
			, tb_bank.b_doc_date
			, tb_bank.f_amount
			, 2
			, tb_cheque.c_code
			, tb_bank.c_code			
		from 
			(select convert(varchar(10), {$fldOn}, 120) as c_doc_date
				, b.c_doc as cheque_no
				, b.c_name
				, b.f_cr
				, a.c_code
			from {$_REQUEST["tableCheque"]}_hdr a
				inner join {$_REQUEST["tableCheque"]}_dtl b on a.{$_REQUEST["tableCheque"]}_hdr_id = b.{$_REQUEST["tableCheque"]}_hdr_id
			where a.i_enable = 1 
				and b.f_cr > 0
				and a.dc_bank_acc_company_id = @dc_bank_acc_company_id
				and cast(year({$fldOn}) as varchar(4)) + right('0'+cast(month({$fldOn}) as varchar(2)), 2) = @c_yyyy_mm) as tb_cheque
		left join
			(select convert(varchar(10), b.d_doc_date, 120) as b_doc_date
				, b.cheque_no
				, ABS(b.f_amount)  as f_amount
				, a.c_code
			from {$_REQUEST["tableBank"]}_hdr a
				inner join {$_REQUEST["tableBank"]}_dtl b on a.{$_REQUEST["tableBank"]}_hdr_id = b.{$_REQUEST["tableBank"]}_hdr_id
			where a.i_enable = 1 
				and b.i_cheque = 1
				and a.dc_bank_acc_company_id = @dc_bank_acc_company_id
				and cast(year(b.d_doc_date) as varchar(4)) + right('0'+cast(month(b.d_doc_date) as varchar(2)), 2) = @c_yyyy_mm) as tb_bank
		on tb_bank.cheque_no = tb_cheque.cheque_no;

		/*รับเงินจากธนาคารในเดือนแต่เลชที่เช็คไม่ตรง*/
		insert into @tb_report
		select b.cheque_no
			, ''
			, ''
			, NULL
			, convert(varchar(10), b.d_doc_date, 120) as b_doc_date
			, ABS(b.f_amount)  as f_amount
			, 3
			, ''
			, a.c_code			
		from {$_REQUEST["tableBank"]}_hdr a
			inner join {$_REQUEST["tableBank"]}_dtl b on a.{$_REQUEST["tableBank"]}_hdr_id = b.{$_REQUEST["tableBank"]}_hdr_id
		where a.i_enable = 1 
			and b.i_cheque = 1
			and a.dc_bank_acc_company_id = @dc_bank_acc_company_id
			and cast(year(b.d_doc_date) as varchar(4)) + right('0'+cast(month(b.d_doc_date) as varchar(2)), 2) = @c_yyyy_mm
			and b.cheque_no not in (select  b.c_doc as cheque_no
									from {$_REQUEST["tableCheque"]}_hdr a
										inner join {$_REQUEST["tableCheque"]}_dtl b on a.{$_REQUEST["tableCheque"]}_hdr_id = b.{$_REQUEST["tableCheque"]}_hdr_id
									where a.i_enable = 1 
										and b.f_cr > 0
										and a.dc_bank_acc_company_id = @dc_bank_acc_company_id);

		select * from @tb_report
		order by i_type, d_cheque_date,c_code_cheque,c_code_bank;";

$stmt = $db->QueryParam($sql, array($dc_bank_acc_company_id, $c_yyyy_mm));
$i = 1;
$str = "";
$chk_cheque_date = "";
while ($data = $db->Fetch($stmt))
{
	/*
	if ($chk_cheque_date != $data["d_cheque_date"])
	{
		$d_cheque_date = ($data["d_cheque_date"] != '')?$date->shot_date_from_db($data["d_cheque_date"]) : '&nbsp';
		$chk_cheque_date = $data["d_cheque_date"];
	}
	else $d_cheque_date = '&nbsp;';
	
									, c_code_cheque varchar(50)
									, c_code_bank varchar(50));
									
	*/
	
	$d_cheque_date = ($data["d_cheque_date"] != '')?$date->shot_date_from_db($data["d_cheque_date"]) : '&nbsp';
	$d_bank_date = ($data["d_bank_date"] != '')?$date->shot_date_from_db($data["d_bank_date"]) : '&nbsp';
	$cheque_amount = ($data["f_cheque_amount"] > 0)? number_format($data["f_cheque_amount"], 2) : '&nbsp';
	$bank_amount = ($data["f_bank_amount"] > 0)? number_format($data["f_bank_amount"], 2) : '&nbsp';
	$f_balanch = $data["f_cheque_amount"]-$data["f_bank_amount"];
	
	if ($f_balanch > 0) {
		$balanch	= number_format($f_balanch, 2);
		$icon		= "x";
		$i_cheque	= 1;
	} else if ($f_balanch < 0) {
		$balanch	= "<font color='red'>".number_format($f_balanch, 2)."</font>";
		$icon		= "x";
		$i_cheque	= 1;
	} else {
		$balanch	= '&nbsp';
		$icon		= "/";
		$i_cheque	= 2;
	}
	
	$cl_cheque	= "style='background-color:#dafbb4;'";
	$cl_bank	= "style='background-color:#f7f0b7;'";
	
	if($_REQUEST["status_cheque"] == $i_cheque || $_REQUEST["status_cheque"] == 0) {
		    $str .= "<tr>"
		    		."<td align='center' nowrap>{$i}</td>"
					."<td align='center' nowrap {$cl_cheque}>{$data["c_code_cheque"]}</td>"
					."<td align='center' nowrap {$cl_cheque}>{$d_cheque_date}</td>"
					."<td align='center' {$cl_cheque}>{$data["cheque_no"]}</td>"
					."<td align='right' {$cl_cheque}>{$cheque_amount}</td>"	
		            ."<td align='center' nowrap {$cl_bank}>{$data["c_code_bank"]}</td>"
					."<td align='center' nowrap {$cl_bank}>{$d_bank_date}</td>"
					."<td align='right' {$cl_bank}>{$bank_amount}</td>"
					."<td align='center'>{$icon}</td>"
					."<td align='right'>{$balanch}</td>"
	            ."</tr>";
		
	    $i++;
	}
}// end while

if ($str == "")
{
	$str = "<tr><td colspan='{$countH}'>ไม่พบข้อมูล</td></tr>";
}

//-----------------------------------
$sql_bank = "select (select c_name from vw_dc_bank where dc_bank_id = a.dc_bank_id) as bank_name
				, (select c_name from vw_dc_bank_branch where dc_bank_branch_id = a.dc_bank_branch_id) as branch_name
				, a.c_code
			from dc_bank_acc_company a
			where dc_bank_acc_company_id = ?";
$data_bank = $db->GetDataBySQL($sql_bank, array($dc_bank_acc_company_id));



$str = "<table cellspacing='0' cellpadding='0' width='100%' border='0' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
            <tr><th colspan='{$countH}'>{$_REQUEST['titleReport']}</th></tr>
			<tr><th colspan='{$countH}'>ประจำเดือน ".$date->l_month_thai[$c_mm]." ปี ".$c_year_thai."</th></tr>
			<tr><th colspan='{$countH}' align='left'>{$data_bank['bank_name']} {$data_bank['branch_name']}</th></tr>
			<tr><th colspan='{$countH}' align='left'>เลขที่บัญชี : {$data_bank['c_code']}</th></tr>
			<tr><th colspan='{$countH}' align='left'>สถานะเช็ค : {$ArrCheque[$_REQUEST["status_cheque"]]}</th></tr>
        </table>
        <table cellspacing='0' cellpadding='0' width='100%' border='1' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
            <tr bgcolor='#A5BAD6'>
            	<th align='center'><b>ลำดับที่</b></th>
                <th align='center'><b>-</b></th>
				<th align='center'><b>วันที่เช็ค</b></th>
                <th align='center'><b>เลชที่เช็ค</b></th>
				<th align='center'><b>จำนวนเงินในเช็ค</b></th>
				<th align='center'><b>#</b></th>
				<th align='center'><b>วันที่จ่ายออกจากธนาคาร</b></th>
				<th align='center'><b>จำนวนเงินที่จ่ายออกจากธนาคาร</b></th>
				<th align='center'><b>สถานะเช็ค</b></th>
				<th align='center'><b>คงเหลือ</b></th>
            </tr>
            {$str}
        </table>
        ";

if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str); 			
?>