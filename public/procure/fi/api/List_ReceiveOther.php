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

if( $_REQUEST["type"] == "fi_receive_other_hdr" ) {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

// 	switch($i_read) {
// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
// 		default:	$con = "";
// 	}

	if($mode == "SEARCH") {
		if( $_REQUEST["value"] != "" ) {
			if( $_REQUEST["filter"] == "print_code" ) {
				$con	.= " AND b.c_area_code LIKE '%".$_REQUEST["value"]."%' ";
			} else {
				$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
			}
		}
		if ( $_REQUEST["c_name"] != "" ) {
			$con	.= " AND (	a.dc_emp_id IN (SELECT dc_emp_id FROM dbo.vw_dc_emp WHERE c_name LIKE '%".$_REQUEST["c_name"]."%')
								OR a.dc_debtor_id IN (SELECT dc_debtor_id FROM dbo.vw_customer WHERE c_name LIKE '%".$_REQUEST["c_name"]."%')
								OR a.c_other_name LIKE '%".$_REQUEST["c_name"]."%' )";
		}
		if ( $_REQUEST["emp_no"] != "" ) { $con .= " AND a.dc_emp_id IN (SELECT dc_emp_id FROM dc_emp WHERE c_code LIKE '%".$_REQUEST["emp_no"]."%')"; }
		if ( $_REQUEST["cus_no"] != "" ) { $con .= " AND a.dc_debtor_id IN (SELECT dc_debtor_id FROM dc_cnt WHERE c_code LIKE '%".$_REQUEST["cus_no"]."%')"; }		
		if($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		}
		if( $_REQUEST["doc_type_id"] > 0 ) { $con .= " AND a.i_type_doc=".$_REQUEST["doc_type_id"]; }
		if( $_REQUEST["c_cheq_code"] != "" ) { $con .= " AND a.c_cheq_code LIKE '%".$_REQUEST["c_cheq_code"]."%' "; }
		if( $_REQUEST["dc_bank_id"] > 0 ) { $con .= " AND a.dc_bank_id=".$_REQUEST["dc_bank_id"]; }
		if( $_REQUEST["i_enable"] > 0 ) { $con .= " AND a.i_enable=".$_REQUEST["i_enable"]; }
		if( $_REQUEST["fi_pymt_voucher_type_id"] > 0 ) { $con .= " AND a.fi_pymt_voucher_type_id=".$_REQUEST["fi_pymt_voucher_type_id"]; }
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.d_doc_date DESC, a.c_area_code DESC) AS numrow
					,a.fi_receive_other_hdr_id
					,a.fi_pymt_voucher_type_id
					,a.c_area_code AS c_code
					,a.i_enable
					,b.c_area_code AS print_code
					,(SELECT TOP 1 LEFT(aa.c_code,1) FROM gl_tran_hdr aa WHERE aa.c_ref_doc=b.c_area_code AND aa.i_enable='1' AND ISNULL(aa.c_code,'0')!='0') AS c_sub
					,(SELECT TOP 1 ISNULL(c_code,'0') FROM gl_tran_hdr aa WHERE aa.c_ref_doc=b.c_area_code AND aa.i_enable='1' AND ISNULL(aa.c_code,'0')!='0') AS c_code_gl
					,a.c_doc_ref
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.i_type_person
					,CASE
						WHEN a.i_type_person = 1 THEN (SELECT CAST(aa.c_name_inv+' ('+substring(aa.c_code,3,5)+')' as varchar(255)) FROM vw_customer aa WHERE aa.dc_debtor_id=a.dc_debtor_id) /* บุคคลภายนอก */
						WHEN a.i_type_person = 3 THEN (SELECT CAST(aa.c_name+' ('+aa.c_code+')' as varchar(255)) FROM vw_dc_emp aa WHERE aa.dc_emp_id=a.dc_emp_id) /* บุคคลภายใน */
						WHEN a.i_type_person = 4 THEN a.c_other_name /* บุคคลทั่วไป */
					END AS c_name
					,(SELECT aa.c_name FROM fi_pymt_voucher_type aa WHERE aa.fi_pymt_voucher_type_id=a.fi_pymt_voucher_type_id) AS pymt_voucher_name /* ประเภทการจ่ายเงิน */
					,CASE
						WHEN a.c_cheq_code != '' AND a.c_cheq_code != '0' THEN a.c_cheq_code
						ELSE ''
					END AS c_cheq_code
					,a.dc_bank_id
					,CASE
						WHEN a.dc_bank_id > 0 THEN (SELECT aa.c_name FROM dc_bank aa WHERE aa.dc_bank_id = a.dc_bank_id)
						ELSE ''
					END AS dc_bank_name
					,a.dc_bank_branch_id
					,CONVERT(VARCHAR, a.d_cheq_date, 120) AS d_cheq_date
					,a.dc_bank_acc_company_id
					,a.fi_receive_wait_dtl_id
					,(SELECT aa.c_name FROM fi_receive_wait_dtl aa WHERE aa.fi_receive_wait_dtl_id=a.fi_receive_wait_dtl_id) AS fi_receive_wait_dtl_name
					,a.c_other_addr
					,a.c_tax_value
					,a.i_branch
					,a.c_branch
					,a.dc_debtor_id
					,(SELECT aa.c_address FROM vw_customer aa WHERE aa.dc_debtor_id=a.dc_debtor_id) AS cnt_address
					,a.dc_emp_id
					,(SELECT aa.c_address FROM vw_dc_emp aa WHERE aa.dc_emp_id=a.dc_emp_id) AS emp_address
					,a.dc_area_id
					,a.i_type_doc
					,a.i_print_eng
					,a.i_is_return
					,a.i_is_print
					,a.c_comment
					,(SELECT SUM(aa.f_receive_net) FROM fi_receive_tran_dtl aa WHERE aa.fi_receive_other_hdr_id=a.fi_receive_other_hdr_id) AS f_receive_net
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
					,CONVERT(VARCHAR, a.d_create, 120) AS d_create
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
					,CONVERT(VARCHAR, a.d_update, 120) AS d_update
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
				INTO #TemData
				FROM fi_receive_other_hdr a
					LEFT JOIN fi_print_receive_other_hdr b ON b.fi_receive_other_hdr_id = a.fi_receive_other_hdr_id
				WHERE ISNULL(a.i_is_settle,0)='0'
					AND ISNULL(a.i_enable,2) = ".$_REQUEST["ena"]."
					AND ISNULL(a.i_is_advance,0)!='1'
					AND ISNULL(a.i_is_other,0)='1'
					AND ISNULL(a.i_is_tax,0)!='1'
				{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["fi_receive_other_hdr_id"],
							"fi_pymt_voucher_type_id"	=> $row["fi_pymt_voucher_type_id"],
							"c_code"					=> ($row["c_code"] != "")? $row["c_code"] : "",
							"c_name"					=> $row["c_name"],
							"print_code"				=> $row["print_code"],
							"c_sub"						=> $row["c_sub"],
							"c_code_gl"					=> $row["c_code_gl"],
							"c_doc_ref"					=> $row["c_doc_ref"],
							"pymt_voucher_name"			=> $row["pymt_voucher_name"],
							"c_cheq_code"				=> $row["c_cheq_code"],
							"dc_bank_id"				=> $row["dc_bank_id"],
							"dc_bank_name"				=> $row["dc_bank_name"],
							"dc_bank_branch_id"			=> $row["dc_bank_branch_id"],
							"d_cheq_date"				=> ($row["d_cheq_date"] != "")? $date->extDateBuddha($row["d_cheq_date"]) : "",
							"dc_bank_acc_company_id"			=> $row["dc_bank_acc_company_id"],
							"fi_receive_wait_dtl_id"	=> $row["fi_receive_wait_dtl_id"],
							"fi_receive_wait_dtl_name"	=> $row["fi_receive_wait_dtl_name"],
							"d_doc_date"				=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"i_type_person"		=> $row["i_type_person"],
							"c_other_addr"				=> $row["c_other_addr"],
							"c_tax_value"				=> $row["c_tax_value"],
							"i_branch"					=> $row["i_branch"],
							"c_branch"					=> $row["c_branch"],
							"dc_debtor_id"					=> $row["dc_debtor_id"],
							"cnt_address"				=> $row["cnt_address"],
							"dc_emp_id"					=> $row["dc_emp_id"],
							"emp_address"				=> $row["emp_address"],
							"dc_area_id"				=> $row["dc_area_id"],
							"i_type_doc"				=> $row["i_type_doc"],
							"f_receive_net"				=> $row["f_receive_net"],
							"i_print_eng"				=> $row["i_print_eng"],
							"i_is_return"				=> $row["i_is_return"],
							"i_is_print"				=> $row["i_is_print"],
							"c_comment"					=> $row["c_comment"],
							"i_enable"					=> $row["i_enable"],
							"show_enable"				=> ( $row["i_enable"] == 1 )? "ใช้งาน" : "ยกเลิก",
							"dc_user_create_id"			=> "{$row["dc_user_create"]}",
							"dc_user_create_cost_id"	=> "{$row["dc_user_create_cost"]}",
							"d_create"					=> ($row["d_create"] != "")? $date->extDateBuddha($row["d_create"]) : "",
							"dc_user_update_id"			=> $row["dc_user_update"],
							"dc_user_update_cost_id"	=> $row["dc_user_update_cost"],
							"d_update"					=> ($row["d_update"] != "")? $date->extDateBuddha($row["d_update"]) : ""
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "fi_receive_tran_dtl" ) {
	
	$totalCount	= 0;
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					a.fi_receive_tran_dtl_id
					,CONCAT(a.c_name1, '', a.c_name2, '', a.c_name3) AS c_name
					,a.f_receive_amt
					,(SELECT aa.f_vat_rate FROM dc_vat aa WHERE aa.dc_vat_id=a.dc_tax_id_vat) AS f_vat_rate
					,a.f_vat
					,(SELECT aa.f_tax_rate FROM dc_tax aa WHERE aa.dc_tax_id=a.dc_tax_id_tax) AS f_tax_rate
					,a.f_tax
					,a.f_receive_net
				FROM fi_receive_tran_dtl a
				WHERE a.fi_receive_other_hdr_id=?
				ORDER BY a.c_name;";

	$arrParam[]	= $_REQUEST["fi_receive_other_hdr_id"];
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"				=> ++$totalCount,
							"id"				=> $row["fi_receive_tran_dtl_id"],
							"c_name"			=> $row["c_name"],
							"f_receive_amt"		=> $row["f_receive_amt"],
							"f_vat_rate"		=> $row["f_vat_rate"],
							"f_vat"				=> $row["f_vat"],
							"f_tax_rate"		=> $row["f_tax_rate"],
							"f_tax"				=> $row["f_tax"],
							"f_receive_net"		=> $row["f_receive_net"]
			);
			
			${$root}[] = $temp;
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "vw_customer" ) {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

// 	switch($i_read) {
// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
// 		default:	$con = "";
// 	}

	if($mode == "SEARCH") {
		if( $_REQUEST["value"] != "" ) {
			$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_name) AS numrow
					,a.*
				INTO #TemData
				FROM vw_customer a
				WHERE a.i_enable='1' AND ISNULL(a.c_code,'0')!='0'
				{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["dc_debtor_id"],
							"c_code"					=> $row["c_code"],
							"c_name"					=> $row["c_name"],
							"c_address"					=> $row["c_address"]
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "vw_detail_dc_emp" ) {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	}

	if($mode == "SEARCH") {
		if( $_REQUEST["value"] != "" ) {
			$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_name) AS numrow
					,a.*
				INTO #TemData
				FROM vw_detail_dc_emp a
				WHERE a.i_enable='1'
				{$con}
			
				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
			
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["dc_emp_id"],
							"c_code"					=> $row["c_code"],
							"c_name"					=> $row["c_name"],
							"cost_name"					=> $row["cost_name"],
							"c_address"					=> $row["c_address"]
			);
				
			${$root}[] = $temp;
		}
	}

	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );

	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;

} else if( $_REQUEST["type"] == "fi_receive_wait_dtl" ) {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	}

	if($mode == "SEARCH") {
		if( $_REQUEST["value"] != "" ) {
			$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}
	}

	$sqlMain = "SET NOCOUNT ON
	
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code) AS numrow
					,a.*
					,CONVERT(VARCHAR, a.d_deposit_date, 120) AS d_deposit_date_N
				INTO #TemData
				FROM fi_receive_wait_dtl a
				WHERE a.i_enable='1'
					AND a.fi_receive_wait_dtl_id NOT IN(SELECT ISNULL(aa.fi_receive_wait_dtl_id,0) FROM fi_receive_other_hdr aa WHERE aa.i_enable='1')
				{$con}
			
				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
			
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["dc_emp_id"],
							"c_code"					=> $row["c_code"],
							"c_name"					=> $row["c_name"],
							"f_receive_amt"				=> $row["f_receive_amt"],
							"d_deposit_date"			=> ($row["d_deposit_date_N"] != "")? $date->extDateBuddha($row["d_deposit_date_N"]) : "",
			);
				
			${$root}[] = $temp;
		}
	}

	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );

	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;

} else if( $_REQUEST["type"] == "List_Calculate" ) { // คำนวณยอดเงินทั้งหมด

	$sqlMain	= "	SELECT
						fi_receive_other_hdr_id
						,i_cont
						,bh_contract_id
						,ISNULL(f_receive_amt,0) AS f_receive_amt
						,ISNULL(f_vat_amt,0) AS f_vat_amt
						,ISNULL(f_net_cost,0) AS f_net_cost
						,ISNULL(f_tax_amt,0) AS f_tax_amt
						,ISNULL(f_tax_net_cost,0) AS f_tax_net_cost
					FROM fi_receive_other_hdr
					WHERE fi_receive_other_hdr_id=?;";

	$arrParam[]	= $_REQUEST["fi_receive_other_hdr_id"];

	$ss	= $db->GetDataBySQL($sqlMain, $arrParam);

	$data["fi_receive_other_hdr_id"]		= $ss["fi_receive_other_hdr_id"];
	$data["i_cont"]						= $ss["i_cont"];
	$data["bh_contract_id"]				= $ss["bh_contract_id"];
	$data["f_receive_amt"]				= $ss["f_receive_amt"];
	$data["f_vat_amt"]					= $ss["f_vat_amt"];
	$data["f_net_cost"]					= $ss["f_net_cost"];
	$data["f_tax_amt"]					= $ss["f_tax_amt"];
	$data["f_tax_net_cost"]				= $ss["f_tax_net_cost"];
	
	echo json_encode(array("success"=>true, "data"=>$data));
	exit;
	
}
?>