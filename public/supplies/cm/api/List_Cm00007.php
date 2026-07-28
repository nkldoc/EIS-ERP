<?php
include("../../conf/config.php");
include("../../ap/conf/configAp.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;

if($_REQUEST["type"] == "cm_voucher_one") {
	
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
		if($_REQUEST["value"] != "") { 
			if($_REQUEST["filter"] == "c_code_ap") {
				$con	.= " AND c.c_code LIKE '%".$_REQUEST["value"]."%' ";
			} else {
				$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
			}
		}
		if($_REQUEST["s_doc_date1"] != "" && $_REQUEST["s_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["s_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["s_doc_date2"]}',102)";
		}
	}
	 
	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code DESC) AS numrow
					,a.cm_voucher_one_id
					,a.c_code
					,c.c_code AS c_code_ap
					,a.cm_pay_type_id
					,e.c_name AS name_vch_type
					,CASE
						WHEN (ISNULL(c.dc_emp_ref_id,0)>0) AND (c.i_is_receiver_diff>0) THEN (SELECT aa.c_name FROM vw_dc_emp aa WHERE aa.dc_emp_id=c.dc_emp_ref_id)
						ELSE c.c_receiver_name
					END AS c_receiver_name
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.f_net_cost
					,a.i_enable
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
					,CONVERT(VARCHAR, a.d_create, 120) AS d_create
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
					,CONVERT(VARCHAR, a.d_update, 120) AS d_update
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
				INTO #TemData
				FROM cm_voucher_one a
					LEFT JOIN ap_expen_hdr c ON a.ap_expen_hdr_id=c.ap_expen_hdr_id
					LEFT JOIN cm_pay_type e ON a.cm_pay_type_id=e.cm_pay_type_id
				WHERE a.i_type_voucher=1
					AND ISNULL(a.cm_pay_type_id,'0')!='0'
					AND ISNULL(a.c_code,'0')!='0'
					AND a.i_enable=1
					{$con};

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row=$db->Fetch( $stmt ) ) {
			
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["cm_voucher_one_id"],
							"c_code"					=> ( $row["c_code"] != "0" )? $row["c_code"] : "",
							"c_code_ap"					=> ( $row["c_code_ap"] != "0" )? $row["c_code_ap"] : "",
							"cm_pay_type_id"			=> $row["cm_pay_type_id"],
							"name_vch_type"				=> $row["name_vch_type"],
							"c_receiver_name"			=> $row["c_receiver_name"],
							"d_doc_date"				=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "", 							
							"f_net_cost"				=> $row["f_net_cost"],
							"i_enable"					=> $row["i_enable"],
							"show_enable"				=> $arr_status[$row["i_enable"]],
							"dc_user_create"			=> "{$row["dc_user_create"]}",
							"dc_user_create_cost"		=> "{$row["dc_user_create_cost"]}",
							"d_create"					=> ($row["d_create"] != "")? $date->extDateBuddha($row["d_create"]) : "",
							"dc_user_update"			=> $row["dc_user_update"],
							"dc_user_update_cost"		=> $row["dc_user_update_cost"],
							"d_update"					=> ($row["d_update"] != "")? $date->extDateBuddha($row["d_update"]) : ""
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "store_voucher_hdr" ) {
	
	//แสดงใบเบิกค่าใช้จ่ายที่ ที่มีสถานะรอทำใบสำคัญจ่ายและจำนวนเงินขอเบิกมากกว่า 0 และยังไม่เคยผ่านการจัดทำใบสำคัญจ่ายมาก่อน และไม่เบิกพร้อมเงินเดือน
	$mode	= @$_REQUEST["mode"];
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
	
	if($mode == "SEARCH") {
		if($_REQUEST["value"] != "") {
			$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}
	}
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code DESC) AS numrow
					,a.cm_voucher_one_id
					,a.c_code
					,c.c_code AS c_code_ap
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,CASE
						WHEN ((c.i_type_person=".PERSON_CREDITOR.") AND (c.dc_creditor_id>0)) THEN (SELECT c_name FROM dbo.vw_dc_creditor WHERE dc_creditor_id=c.dc_creditor_id)
						WHEN ((c.i_type_person=".PERSON_EMP.") AND (c.dc_emp_id>0)) THEN (SELECT c_name FROM dc_emp WHERE dc_emp_id=c.dc_emp_id)
						WHEN ((c.i_type_person=".PERSON_OTHER.") AND (c.c_other_name!='')) THEN c.c_other_name
						ELSE ''
					END AS creditor_type_name /* ชื่อเจ้าหนี้ */
					,CASE
						WHEN (c.i_is_receiver_diff=3) THEN c.c_receiver_name
						ELSE (SELECT c_name FROM dc_emp WHERE dc_emp_id=c.dc_emp_id)
					END AS c_receiver_name
					,CASE
						WHEN (c.i_is_receiver_diff=3)
							THEN CASE
								WHEN (c.i_type_person=".PERSON_CREDITOR.") THEN dbo.fn_get_bbank(c.i_type_person,ISNULL(c.dc_creditor_id,0),1)
								WHEN (c.i_type_person=".PERSON_EMP.") THEN dbo.fn_get_bbank(c.i_type_person,ISNULL(c.dc_emp_id,0),1)
								ELSE dbo.fn_get_bbank(c.i_type_person,0,1)
							END 
						ELSE dbo.fn_get_bbank(3,ISNULL(c.dc_emp_ref_id,0),1)
					END AS c_receiver_bbank
					,a.f_net_cost
				INTO #TemData
				FROM cm_voucher_one a
					LEFT JOIN ap_expen_hdr c ON a.ap_expen_hdr_id=c.ap_expen_hdr_id
				WHERE a.i_type_voucher=1
					AND ISNULL(a.cm_pay_type_id,'0')='0'
					AND ISNULL(a.c_code,'0')!='0'
					AND a.i_enable=1
					{$con};
	
				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
	
				SELECT COUNT(*) AS rowCounts FROM #TemData;";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row=$db->Fetch( $stmt ) ) {
				
			$temp = array(	"no"					=> $row["numrow"],
							"id"					=> $row["cm_voucher_one_id"],
							"c_code"				=> $row["c_code"],
							"c_code_ap"				=> $row["c_code_ap"],
							"d_doc_date"			=> $date->long_date_from_db($row["d_doc_date"]),
							"creditor_type_name"	=> $row["creditor_type_name"],
							"c_receiver_name"		=> $row["c_receiver_name"],
							"c_receiver_bbank"		=> $row["c_receiver_bbank"],
							"f_net_cost"			=> $row["f_net_cost"]
			);
				
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "LIST_EDIT" ) {

	$sqlMain	= "	SELECT
						a.cm_voucher_one_id
						,a.c_code
						,e.c_name AS name_vch_type
						,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
						,c.c_code AS c_code_ap
						,CASE
							WHEN ((c.i_type_person=".PERSON_CREDITOR.") AND (c.dc_creditor_id>0)) THEN (SELECT c_name FROM dbo.vw_dc_creditor WHERE dc_creditor_id=c.dc_creditor_id)
							WHEN ((c.i_type_person=".PERSON_EMP.") AND (c.dc_emp_id>0)) THEN (SELECT c_name FROM dc_emp WHERE dc_emp_id=c.dc_emp_id)
							WHEN ((c.i_type_person=".PERSON_OTHER.") AND (c.c_other_name!='')) THEN c.c_other_name
							ELSE ''
						END AS creditor_type_name
						,CASE
							WHEN (c.i_is_receiver_diff=3) THEN c.c_receiver_name
							ELSE (SELECT c_name FROM dc_emp WHERE dc_emp_id=c.dc_emp_id)
						END AS c_receiver_name
						,CASE
							WHEN (c.i_is_receiver_diff=3)
								THEN CASE
									WHEN (c.i_type_person=".PERSON_CREDITOR.") THEN dbo.fn_get_bbank(c.i_type_person,ISNULL(c.dc_creditor_id,0),1)
									WHEN (c.i_type_person=".PERSON_EMP.") THEN dbo.fn_get_bbank(c.i_type_person,ISNULL(c.dc_emp_id,0),1)
									ELSE dbo.fn_get_bbank(c.i_type_person,0,1)
								END 
							ELSE dbo.fn_get_bbank(3,ISNULL(c.dc_emp_ref_id,0),1)
						END AS c_receiver_bbank
						,a.f_net_cost
						,a.cm_pay_type_id
					FROM cm_voucher_one a
						LEFT JOIN ap_expen_hdr c ON a.ap_expen_hdr_id=c.ap_expen_hdr_id
						LEFT JOIN cm_pay_type e ON a.cm_pay_type_id=e.cm_pay_type_id
					WHERE a.i_type_voucher=1
						AND ISNULL(a.cm_pay_type_id,0)!=0
						AND ISNULL(a.c_code,'0')!='0'
						AND a.i_enable=1
						AND a.cm_voucher_one_id=?";
	
	$arrParam[]	= $_REQUEST["cm_voucher_one_id"];
	$ss			= $db->GetDataBySQL($sqlMain, $arrParam);

	$data["c_code"]				= $ss["c_code"];
	$data["name_vch_type"]		= $ss["name_vch_type"];
	$data["d_doc_date"]			= $date->long_date_from_db($ss["d_doc_date"]);
	$data["c_code_ap"]			= $ss["c_code_ap"];
	$data["creditor_type_name"]	= $ss["creditor_type_name"];
	$data["c_receiver_name"]	= $ss["c_receiver_name"];
	$data["c_receiver_bbank"]	= $ss["c_receiver_bbank"];
	$data["f_net_cost"]			= $ss["f_net_cost"];
	$data["cm_pay_type_id"]		= $ss["cm_pay_type_id"];

	echo json_encode(array("success"=>true, "data"=>$data));
	exit;
	
}
?>
