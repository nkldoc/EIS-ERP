<?php 
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;

if( $_REQUEST["type"] == "imp_bank_account_detail_hdr") {

	$fldPkName		= "{$_REQUEST["type"]}_id";
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

	if($mode == "SEARCH") {
		
		if( $_REQUEST["value"] != "" ) {
			$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}		
		if($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		}
	}
	
	$sqlMain = "SET NOCOUNT ON
				DECLARE @temp_tbl as table(numrow bigint
										, imp_bank_account_detail_hdr_id bigint
										, dc_bank_id bigint
										, dc_bank_name varchar(255)
										, dc_bank_acc_company_id bigint
										, dc_bank_acc_company_name varchar(255)
										, c_doc varchar(255)
										, d_doc_date varchar(10)
										, i_book_type tinyint
										, book_type_name varchar(255)
										, c_comment varchar(255)
										, i_enable tinyint
										, dc_user_create varchar(255)
										, dc_user_create_cost varchar(255)
										, d_create varchar(30)
										, dc_user_update varchar(255)
										, dc_user_update_cost varchar(255)
										, d_update varchar(30)
										);

				INSERT INTO @temp_tbl
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.d_doc_date DESC) AS numrow
					,a.{$fldPkName}
					,a.dc_bank_id
					,(SELECT aa.c_name FROM dc_bank aa WHERE aa.dc_bank_id=a.dc_bank_id) AS dc_bank_name
					, a.dc_bank_acc_company_id
					,(SELECT aa.c_name FROM dc_bank_acc_company aa WHERE aa.dc_bank_acc_company_id=a.dc_bank_acc_company_id) AS dc_bank_acc_company_name
					,a.c_doc
					,CONVERT(VARCHAR(10), a.d_doc_date, 120) AS d_doc_date
					,a.i_book_type
					,case a.i_book_type when 1 then 'สมุดรายวันรับ'  when 3 then 'สมุดรายวันจ่าย'  else 'สมุดรายวันทั่วไป' end book_type_name
					,a.c_comment
					,a.i_enable
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
					,CONVERT(VARCHAR(30), a.d_create, 120) AS d_create
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
					,CONVERT(VARCHAR(30), a.d_update, 120) AS d_update
				FROM {$_REQUEST["type"]} a
				WHERE a.i_enable = 1
					{$con}

				SELECT * FROM @temp_tbl a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
								
				SELECT COUNT(*) AS rowCounts FROM @temp_tbl;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

//echo $sqlMain; print_r($arrParam); exit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["{$fldPkName}"],
							"dc_bank_idID"						=> $row["dc_bank_id"],
							"dc_bank_name"						=> $row["dc_bank_name"],
							"dc_bank_acc_company_idID"			=> $row["dc_bank_acc_company_id"],
							"dc_bank_acc_company_name"			=> $row["dc_bank_acc_company_name"],
							"c_doc"								=> $row["c_doc"],
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"i_book_type"						=> $row["i_book_type"],
							"book_type_name"					=> $row["book_type_name"],
							"i_enable"							=> $row["i_enable"],
							"c_comment"							=> $row["c_comment"],
							"show_enable"						=> ( $row["i_enable"] == 1 )? "ใช้งาน" : "ยกเลิก",
							"dc_user_create_id"					=> "{$row["dc_user_create"]}",
							"dc_user_create_cost_id"			=> "{$row["dc_user_create_cost"]}",
							"d_create"							=> ($row["d_create"] != "")? $date->extDateBuddha($row["d_create"]) : "",
							"dc_user_update_id"					=> $row["dc_user_update"],
							"dc_user_update_cost_id"			=> $row["dc_user_update_cost"],
							"d_update"							=> ($row["d_update"] != "")? $date->extDateBuddha($row["d_update"]) : ""					
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "imp_bank_account_detail_dtl" ) {
	
	$tableHdr	= $_REQUEST["table"]."_hdr";
	$tableDtl	= $_REQUEST["table"]."_dtl";
	$imp_hdr_id = $_REQUEST["id"];
	$sqlDtl = "SET NOCOUNT ON
				DECLARE @hdr_id AS BIGINT;
				SET @hdr_id = ?;
				SELECT ROW_NUMBER() OVER (ORDER BY a.imp_bank_account_detail_dtl_id ASC) AS numrow
					, imp_bank_account_detail_dtl_id
					, imp_bank_account_detail_hdr_id
					, f_dr
					, f_cr
					, a.c_comment
				FROM imp_bank_account_detail_dtl a
				WHERE imp_bank_account_detail_hdr_id = @hdr_id";
				
	$ww = $db->QueryParam($sqlDtl, array($imp_hdr_id));
	
	$tmp_pay_type_name = "";
	$tmp_paidby = "";
	$sum_paidby = 0.00;
	
	$sum_dr = 0.00;
	$sum_cr = 0.00;
	$totalCount = 0;
	$no = 1;
	$f_sum_paidby = 0.00;
	while( $rr = $db->Fetch( $ww ) ) {
		
		$temp = array();
		$temp["i_level"]						= 1;
		$temp["no"]								= $rr["numrow"];
		$temp["imp_bank_account_detail_dtl_id"]	= $rr["imp_bank_account_detail_dtl_id"];
		$temp["imp_bank_account_detail_hdr_id"] = $rr["imp_bank_account_detail_dtl_id"];
		$temp["f_dr"] 							= number_format($rr["f_dr"], 2);
		$temp["f_cr"] 							= number_format($rr["f_cr"], 2);
		$temp["c_comment"] 						= $rr["c_comment"];

		${$root}[]	= $temp;
		$sum_dr += $rr["f_dr"];
		$sum_cr += $rr["f_cr"];
		$no++;
		$totalCount++;
	}
	$temp = array();
	$temp["i_level"]						= 2;
	$temp["no"]								= "";
	$temp["imp_bank_account_detail_dtl_id"]	= "";
	$temp["imp_bank_account_detail_hdr_id"] = "";
	$temp["f_dr"] 							= number_format($sum_dr, 2);
	$temp["f_cr"] 							= number_format($sum_cr, 2);
	$temp["c_comment"] 						= "";

	${$root}[]	= $temp;
	
	echo json_encode(array("success"=>true, "totalCount"=>$totalCount, $root=>${$root}));
	exit;

} else if($_REQUEST["type"] == "POPDTL") {

	$table		= $_REQUEST["table"];
	$hdrID		= $_REQUEST["hdr_id"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 10000; }else{ $limit=($limit+$start); }

	$sqlTempTable	= "	SELECT
							ROW_NUMBER() OVER (ORDER BY a.imp_bank_account_detail_dtl_id) AS numrow
							,a.imp_bank_account_detail_dtl_id
							,a.imp_bank_account_detail_hdr_id
							,a.f_dr
							,a.f_cr
							,ISNULL(a.c_comment, '') as c_comment
						FROM imp_bank_account_detail_dtl a
						WHERE a.imp_bank_account_detail_hdr_id = {$hdrID}";

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {

		$totalCount	= 0;

		while($row = $db->Fetch($stmt)) {
			$temp = array(	"no"					=> $row["numrow"],
							"id"					=> $row["imp_bank_account_detail_dtl_id"],
							"f_dr"					=> ($row["f_dr"] != "")? $row["f_dr"] : "",
							"f_cr"					=> ($row["f_cr"] != "")? $row["f_cr"] : "",
							"c_comment"				=> ($row["c_comment"] != "")? $row["c_comment"] : "",
			);

			$totalCount++;
				
			${$root}[] = $temp;
		}
	}

	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
	exit;
}
?>