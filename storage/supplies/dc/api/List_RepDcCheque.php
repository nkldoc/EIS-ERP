<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php"); 
include("../../lib/date/i_date.class.php");
include("../conf/configDc.php");

$db 		= new DatabaseServer();
$date		= new i_date();

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam() {
	
	global $db, $date, $root, $data, $con, $arr_status;
 
	$totalCount		= 0;
	
	if($_REQUEST["i_enable"] > 0) { $con .= " AND a.i_enable = ".$_REQUEST["i_enable"]; } 
	
	$sqlMain = "SET NOCOUNT ON
				SELECT a.* 
						,CASE 
							WHEN (a.i_status=1) THEN 'ว่าง'
							WHEN (a.i_status=2) THEN 'ระบุ'
							WHEN (a.i_status=3) THEN 'ตรวจ'
							WHEN (a.i_status=4) THEN 'จ่าย'
							WHEN (a.i_status=9) THEN 'ยกเลิก'
							ELSE '-'
						END as c_status
						,b.c_bank_name as c_bank_name
						,b.c_code as c_book_number
						,b.c_name as c_book_name
						,b.c_branch_name as c_book_branch_name
						,b.c_type_name as c_book_type_name
				FROM dc_cheque a INNER JOIN vw_dc_bank_acc_company_full b on a.dc_bank_acc_company_id = b.dc_bank_acc_company_id
				WHERE a.i_delete = ".DELETE_FALSE."
					{$con}
				ORDER BY c_show;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
 
			
			
			
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"						=> ++$totalCount,
							"id"						=> $row["dc_cheque_id"],  
							"dc_bank_acc_company_id"	=> $row["dc_bank_acc_company_id"], 
							"c_cheque"					=>$row["c_cheque"],	
							"c_show"					=>$row["c_show"],	
							"i_total"					=>$row["i_total"],	
							"d_doc"						=>$row["d_doc"],	
							"d_gen"						=>$row["d_gen"],	
							"f_money"					=>$row["f_money"],	
							"c_comment"					=>$row["c_comment"],	
							"i_status"					=>$row["i_status"],	
							"i_enable"					=>$row["i_enable"],	
							"i_delete"					=>$row["i_delete"],
							"c_status"					=>$row["c_status"],
							"c_bank_name"				=>$row["c_bank_name"],
							"c_book_number"				=>$row["c_book_number"],
							"c_book_name"				=>$row["c_book_name"],
							"c_book_branch_name"		=>$row["c_book_branch_name"],
							"c_book_type_name"			=>$row["c_book_type_name"]);
			
			${$root}[] = $temp;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
