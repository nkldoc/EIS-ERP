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

if( $_REQUEST["type"] == "imp_expense_approve" ) {
	
	$mode		= @$_REQUEST["mode"];
	$i_read		= @$_REQUEST["i_read"];
	
	$limit 		= @$_REQUEST["limit"];
	$start 		= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
 
	if($mode == "SEARCH") {
		
		if( $_REQUEST["value"] != "" ) {
			$con	.= " AND bb.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}	

		if($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND bb.d_doc BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		} 

	}

	switch ($_REQUEST["i_type_menu"])
	{
		case 5 	: //EP-Special 
		case "5":
		default	:
					$tb_hdr_name 		= "imp_request_ephis_hdr";
					$tb_hdr_pk_id_name 	= "imp_request_ephis_hdr_id";
					$tb_dtl_name 		= "imp_request_ephis_dtl";
					$tb_dtl_pk_id_name 	= "imp_request_ephis_dtl_id"; 
					$fld_name_acc_item	= "bb.c_acc_item";
					$tb_item_name		= "imp_request_ephis_item";
					$ww_f_money			= "(select sum(gg.f_inv) from $tb_item_name gg where gg.$tb_dtl_pk_id_name=bb.$tb_dtl_pk_id_name)";
				break;
		case 6 	: //VNet-Special 
		case "6":
					$tb_hdr_name 		= "imp_request_vsn_hdr";
					$tb_hdr_pk_id_name 	= "imp_request_vsn_hdr_id";
					$tb_dtl_name 		= "imp_request_vsn_dtl";
					$tb_dtl_pk_id_name 	= "imp_request_vsn_dtl_id"; 	
					$fld_name_acc_item	= "bb.c_comment";
					$tb_item_name		= "imp_request_vsn_item";
					$ww_f_money			= "(select sum(gg.f_dr) from $tb_item_name gg where gg.$tb_dtl_pk_id_name=bb.$tb_dtl_pk_id_name)";
				break; 
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY bb.c_request, aa.c_code) AS numrow
					,'".$tb_hdr_name."' AS table_name
					,aa.".$tb_hdr_pk_id_name."  AS hdr_id
					,bb.".$tb_dtl_pk_id_name."  AS dtl_id 
					,bb.c_request
					,bb.c_request_desc 
					,CONVERT(VARCHAR,bb.d_doc, 120)  as d_doc_date
					,$fld_name_acc_item as c_acc_item
					,ISNULL(".$ww_f_money.",0) AS f_inv
					,bb.i_status 
 					,aa.c_code as c_code_request
					,bb.c_creditor
					,case 
						when (bb.i_status='2') 	then 'ส่งเบิกสมบูรณ์'
						when (bb.i_status='8')  then 'ปรับสถานะไม่ใช้งานใบเบิก'
						else NULL
					end as c_status_doc 
					,cc.c_cancel_reason
				INTO #TemData
				FROM  ".$tb_hdr_name." aa
						INNER JOIN ".$tb_dtl_name." bb ON aa.".$tb_hdr_pk_id_name." = bb.".$tb_hdr_pk_id_name."
 						LEFT JOIN imp_cancel_request cc ON cc.".$tb_dtl_pk_id_name."  = bb.".$tb_dtl_pk_id_name." 
				WHERE aa.i_enable=1 and left(aa.c_code,1)='I' and aa.i_type_request=1
						and bb.i_status in (2,8) 
						{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
   //echo $sqlMain;exit;
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["dtl_id"],
							"hdr_id"							=> $row["hdr_id"], 
							"table_name"						=> $row["table_name"], 
							"c_request"							=> $row["c_request"],
							"c_request_desc"					=> $row["c_request_desc"],
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"c_acc_item"						=> $row["c_acc_item"],
							"f_inv"								=> $row["f_inv"],
							"i_status"							=> $row["i_status"],  
							"c_code_request"					=> $row["c_code_request"],
							"c_creditor"						=> $row["c_creditor"],
							"c_status_doc"						=> $row["c_status_doc"],
							"c_cancel_reason"					=> $row["c_cancel_reason"]
							 
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