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

if( $_REQUEST["type"] == "imp_receive_hdr") {

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
										, imp_receive_hdr_id bigint
										, c_code varchar(255)
										, c_gx_code varchar(255)
										, i_post tinyint
										, dc_receive_point_id bigint
										, dc_receive_point_name varchar(255)
										, dc_period_id bigint
										, dc_period_name varchar(255)
										, c_receive_name varchar(250)
										, d_doc_date varchar(10)
										, i_enable tinyint
										, c_comment varchar(255)
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
					,a.c_code
					,b.c_code AS c_gx_code
					,b.i_is_post AS i_post
					,a.dc_receive_point_id
					,(SELECT aa.c_name FROM dc_receive_point aa WHERE aa.dc_receive_point_id=a.dc_receive_point_id) AS dc_receive_point_name
					, a.dc_period_id
					,(SELECT aa.c_name FROM dc_period aa WHERE aa.dc_period_id=a.dc_period_id) AS dc_period_name
					,a.c_receive_name
					,CONVERT(VARCHAR(10), a.d_doc_date, 120) AS d_doc_date
					,a.i_enable
					,a.c_comment
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
					,CONVERT(VARCHAR(30), a.d_create, 120) AS d_create
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
					,CONVERT(VARCHAR(30), a.d_update, 120) AS d_update
				FROM {$_REQUEST["type"]} a
					INNER JOIN gl_tran_hdr b ON a.c_gx_code = b.c_code
				WHERE (b.i_is_post = 3 OR b.i_is_post = 2) AND a.i_enable = 1
					{$con}

				SELECT * FROM @temp_tbl a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
								
				SELECT COUNT(*) AS rowCounts FROM @temp_tbl;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

//echo $sqlMain;exit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["{$fldPkName}"], 
							"c_code"							=> ($row["c_code"] != "")? $row["c_code"] : "",
							"c_gx_code"							=> ($row["c_gx_code"] != "")? $row["c_gx_code"] : "",
							"i_post"							=> $row["i_post"],
							"dc_receive_point_id"				=> $row["dc_receive_point_id"],
							"dc_receive_point_name"				=> $row["dc_receive_point_name"],
							"dc_period_id"						=> $row["dc_period_id"],
							"dc_period_name"					=> $row["dc_period_name"],
							"c_receive_name"					=> $row["c_receive_name"],
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
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
	
} else if( $_REQUEST["type"] == "imp_receive_dtl" ) {
	
	$tableHdr	= $_REQUEST["table"]."_hdr";
	$tableDtl	= $_REQUEST["table"]."_dtl";
	$imp_hdr_id = $_REQUEST["id"];
	$sqlDtl = "SET NOCOUNT ON
				DECLARE @import_hdr_id AS BIGINT;
				SET @import_hdr_id = ?;
				SELECT imp_receive_hdr_id
					, paidby
					, CASE paidby 
							WHEN '10' THEN 'เงินสด'
							WHEN '20' THEN 'บัตรเครดิต'
							WHEN '30' THEN 'เช็ค'
							WHEN '40' THEN 'เงินโอน'
						END AS pay_type_name
					, '' AS c_payin_no
					, NULL AS d_payin
					, SUM(rcptamt) AS f_amount
					, '' AS c_comment
					, (SELECT COUNT(c_payin_no) FROM imp_receive_statement WHERE imp_receive_hdr_id=a.imp_receive_hdr_id AND paidby = a.paidby) AS i_item
					, 1 AS i_type
				FROM imp_receive_dtl a
				WHERE imp_receive_hdr_id = @import_hdr_id
				GROUP BY imp_receive_hdr_id, paidby
				UNION
				SELECT imp_receive_hdr_id
					, paidby
					, '' AS pay_type_name
					, ISNULL(c_payin_no, '') as c_payin_no
					, ISNULL(CONVERT(VARCHAR(10), d_payin, 120), '') AS d_payin
					, f_amount
					, ISNULL(c_comment, '') as c_comment
					, 0 AS i_item
					, 2 AS i_type
				FROM imp_receive_statement
				WHERE imp_receive_hdr_id = @import_hdr_id
				ORDER BY paidby, i_type";
				
	$ww = $db->QueryParam($sqlDtl, array($imp_hdr_id));
	
	$tmp_pay_type_name = "";
	$tmp_paidby = "";
	$sum_paidby = 0.00;
	$totalCount = 0;
	$no = 1;
	$f_sum_paidby = 0.00;
	while( $rr = $db->Fetch( $ww ) ) {
		
		if ($tmp_paidby != $rr["paidby"]){
			
			if ($sum_paidby > 0){
				$temp = array();
				$temp["no"]					= 0;
				$temp["imp_receive_hdr_id"]	= 0;
				$temp["paidby"] 			= $tmp_paidby;
				$temp["pay_type_name"] 		= $tmp_pay_type_name;
				$temp["c_payin_no"] 		= "";
				$temp["d_payin"] 			= "";
				$temp["f_amount"] 			= number_format($sum_paidby, 2);
				$temp["c_comment"] 			= "";
				$temp["i_item"] 			= 0;
				$temp["i_type"] 			= 3;
				$temp["i_chk"]				= ($f_sum_paidby == $sum_paidby)? true : false;
				
				${$root}[]	= $temp;
				$totalCount++;
			}
			$tmp_pay_type_name = $rr["pay_type_name"];
			$tmp_paidby = $rr["paidby"];
			$f_sum_paidby = round($rr["f_amount"],2);
			$sum_paidby = 0.00;
			$no = 1;
		}
		
		$temp = array();
		$temp["no"]					= $no;
		$temp["imp_receive_hdr_id"]	= $rr["imp_receive_hdr_id"];
		$temp["paidby"] 			= $rr["paidby"];
		$temp["pay_type_name"] 		= $rr["pay_type_name"];
		$temp["c_payin_no"] 		= $rr["c_payin_no"];
		$temp["d_payin"] 			= ($rr["d_payin"] != "")? $date->shot_date_from_db($rr["d_payin"]) : "";
		$temp["f_amount"] 			= number_format($rr["f_amount"], 2);
		$temp["c_comment"] 			= $rr["c_comment"];
		$temp["i_item"] 			= $rr["i_item"];
		$temp["i_type"] 			= $rr["i_type"];
		$temp["i_chk"]				= false;
		
		if ($rr["i_type"] == 2)
			$sum_paidby += round($rr["f_amount"], 2);
		
		${$root}[]	= $temp;
		$no++;
		$totalCount++;
	}
	
	if ($sum_paidby > 0){
		$temp = array();
		$temp["no"]					= 0;
		$temp["imp_receive_hdr_id"]	= 0;
		$temp["paidby"] 			= $tmp_paidby;
		$temp["pay_type_name"] 		= $tmp_pay_type_name;
		$temp["c_payin_no"] 		= "";
		$temp["d_payin"] 			= "";
		$temp["f_amount"] 			= number_format($sum_paidby, 2);
		$temp["c_comment"] 			= "";
		$temp["i_item"] 			= 0;
		$temp["i_type"] 			= 3;
		$temp["i_chk"]				= ($f_sum_paidby == $sum_paidby)? true : false;
		
		${$root}[]	= $temp;
		$totalCount++;
	}
	
	echo json_encode(array("success"=>true, "totalCount"=>$totalCount, $root=>${$root}));
	exit;

} else if($_REQUEST["type"] == "POPDTL") {

	$table		= $_REQUEST["table"];
	$hdrID		= $_REQUEST["hdr_id"];
	$paidby		= $_REQUEST["paidby"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 10000; }else{ $limit=($limit+$start); }

	$sqlTempTable	= "	SELECT
							ROW_NUMBER() OVER (ORDER BY a.i_no) AS numrow
							,a.imp_receive_hdr_id
							,a.paidby
							,ISNULL(a.c_payin_no, '') as c_payin_no
							,ISNULL(CONVERT(VARCHAR(10), a.d_payin, 120),'') AS d_payin
							,a.f_amount
							,ISNULL(a.c_comment, '') as c_comment
						FROM {$table}_statement a
						WHERE a.imp_receive_hdr_id = {$hdrID} and paidby = '{$paidby}'";

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {

		$totalCount	= 0;

		while($row = $db->Fetch($stmt)) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["imp_receive_hdr_id"],
							"paidby"					=> $row["paidby"],
							"c_payin_no"				=> ($row["c_payin_no"] != "")? $row["c_payin_no"] : "",
							"d_payin"					=> ($row["d_payin"] != "")? $date->extDateBuddha($row["d_payin"]) : "",
							"f_amount"					=> ($row["f_amount"] != "")? $row["f_amount"] : "",
							"c_comment"					=> ($row["c_comment"] != "")? $row["c_comment"] : "",
			);

			$totalCount++;
				
			${$root}[] = $temp;
		}
	}

	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
	exit;
}
?>