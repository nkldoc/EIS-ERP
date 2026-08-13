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

if($_REQUEST["type"] == "cm_voucher_one") {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

	if($mode == "SEARCH") {
		
		if( $_REQUEST["value"] != "" ) { 
			$con .= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}
		if( $_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "" ) {
			$con .= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}',102)";
		}
		if( $_REQUEST["cm_pay_type_id"] != "99" ) { $con .= " AND a.cm_pay_type_id=".$_REQUEST["cm_pay_type_id"]; }
		if( $_REQUEST["chk_date_pv"] == "true" ) {
			$con .= " AND a.d_doc_date_pv BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date_pv1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date_pv2"]}',102)";
		}
	}
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.d_doc_date_pv DESC,a.c_code_pv DESC) AS numrow
					,a.cm_voucher_one_id
					,CASE WHEN a.c_code_pv != '0' THEN a.c_code_pv ELSE '' END AS c_code_pv
					,c.c_code AS c_code_ap
					,CASE
						WHEN a.c_code_pv!='0' THEN (SELECT TOP 1 c_code FROM gl_tran_hdr WHERE c_ref_doc=a.c_code_pv AND i_enable=1 AND LEFT(c_code,1)='G')
						WHEN a.c_code_pv IS NOT NULL THEN (SELECT TOP 1 c_code FROM gl_tran_hdr WHERE c_ref_doc=a.c_code_pv AND i_enable=1 AND LEFT(c_code,1)='G')
					END AS c_code_gl
					,CONVERT(VARCHAR, a.d_doc_date_pv, 120) AS d_doc_date_pv
					,a.c_code
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,d.c_name AS name_vch_type
					,a.f_total_cost
					,CASE
						WHEN a.i_is_cancel_pv = 1 THEN
							( SELECT TOP 1
								'ยกเลิก #'+CAST(( SELECT COUNT(cm_cancel_history_id) FROM cm_cancel_history WHERE cm_voucher_one_id=a.cm_voucher_one_id AND i_cancel_type=2 ) AS VARCHAR(255))
								+' โดย'+CAST(user_cancel_name AS VARCHAR(255))+'<br>'
								+'เมื่อ '+CAST(c_cancel_date AS VARCHAR(255))+' เวลา '+CAST(c_cancel_time AS VARCHAR(255))
							FROM cm_cancel_history
							WHERE cm_voucher_one_id=a.cm_voucher_one_id AND i_cancel_type=2 )
						ELSE ''
					END AS c_cancel
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
					,CONVERT(VARCHAR, a.d_create, 120) AS d_create
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
					,CONVERT(VARCHAR, a.d_update, 120) AS d_update
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
				INTO #TemData
				FROM cm_voucher_one a
					LEFT JOIN ap_expen_hdr c ON a.ap_expen_hdr_id=c.ap_expen_hdr_id
					LEFT JOIN cm_pay_type d ON a.cm_pay_type_id = d.cm_pay_type_id
				WHERE ISNULL(a.cm_pay_type_id,0)>0
					AND a.i_enable=1
					AND a.i_type_voucher=1
					AND ISNULL(a.ap_expen_hdr_id,0)!=0
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
							"c_code_pv"					=> ( $row["c_code_pv"] != "" )? $row["c_code_pv"] : "",
							"c_code_ap"					=> ( $row["c_code_ap"] != "" )? $row["c_code_ap"] : "",
							"c_code_gl"					=> ( $row["c_code_gl"] != "" )? $row["c_code_gl"] : "",
							"d_doc_date_pv"				=> ($row["d_doc_date_pv"] != "")? $date->extDateBuddha($row["d_doc_date_pv"]) : "",
							"c_code"					=> ( $row["c_code"] != "" )? $row["c_code"] : "",
							"d_doc_date"				=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"name_vch_type"				=> $row["name_vch_type"],
							"f_total_cost"				=> $row["f_total_cost"],
							"c_cancel"					=> $row["c_cancel"],
							"dc_user_create"			=> $row["dc_user_create"],
							"dc_user_create_cost"		=> $row["dc_user_create_cost"],
							"d_create"					=> ($row["d_create"] != "")? $date->extDateBuddha($row["d_create"]) : "",
							"dc_user_update"			=> $row["dc_user_update"],
							"d_update"					=> ($row["d_update"] != "")? $date->extDateBuddha($row["d_update"]) : "",
							"dc_user_update_cost"		=> $row["dc_user_update_cost"]
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
}
?>
