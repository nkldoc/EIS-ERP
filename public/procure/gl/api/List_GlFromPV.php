<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php"); 
include("../conf/configGl.php");
include("../../ap/conf/configAp.php");
include("../../cm/conf/configCm.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;

$type 		= @$_REQUEST["type"];
$start 		= @$_REQUEST["start"];
$limit 		= @$_REQUEST["limit"];

if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

switch( $type ) {

	case "dataPV" :

		$filter 		= @$_REQUEST["filter"];
		$value			= @$_REQUEST["value"];
		$d_doc_date1 	= @$_REQUEST["d_doc_date1"];
		$d_doc_date2 	= @$_REQUEST["d_doc_date2"];
		$i_type_voucher = @$_REQUEST["i_type_voucher"];

		$date_start		= ( $d_doc_date1 == "" )? date("Y-m-d", mktime(0,0,0,(date("m")-2),1,date("Y"))) : $d_doc_date1;
		$date_end		= ( $d_doc_date2 == "" )? date("Y-m-d") : $d_doc_date2;

		//===================================//
		if ($filter != "" && $value != "") { $con	.= " AND a.{$filter} LIKE '%{$value}%'"; }
		if ( $i_type_voucher > 0 ) { $con	.= " AND a.i_type_voucher = {$i_type_voucher}"; }
		//===================================//
		$sqlMain = "SET NOCOUNT ON
					SELECT
						ROW_NUMBER() OVER (ORDER BY a.d_doc_date_pv DESC, a.c_code_pv DESC) AS numrow
						,a.cm_voucher_one_id
						,a.c_code_pv
						,ISNULL((SELECT TOP 1
							CASE
								WHEN c_code='0' THEN 'รายการรอลงบัญชี'
								WHEN LEFT(c_code,1)='G' THEN c_code
							END
						FROM gl_tran_hdr WHERE c_ref_doc=a.c_code_pv AND i_enable=1 ORDER BY gl_tran_hdr_id DESC), 'ยังไม่บันทึกบัญชี') AS c_code_gx
						,a.i_type_voucher
						,(	CASE
								WHEN a.ap_expen_hdr_id != 0 THEN (SELECT c_code FROM ap_expen_hdr WHERE ap_expen_hdr_id=a.ap_expen_hdr_id)
								WHEN a.ap_br_id != 0 THEN (SELECT c_code FROM ap_br WHERE ap_br_id=a.ap_br_id)
								ELSE '0'
							END ) AS c_code_ap
						,ISNULL(CONVERT(VARCHAR, a.d_doc_date_pv, 120), '') as d_doc_date_pv
						,a.c_code
						,ISNULL(CONVERT(VARCHAR, a.d_doc_date, 120), '') as d_doc_date
						,(SELECT c_name FROM cm_pay_type WHERE cm_pay_type_id=a.cm_pay_type_id) AS name_cash_type
						,a.f_net_cost
						,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
						,CONVERT(VARCHAR, a.d_create, 120) AS d_create
						,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
						,CONVERT(VARCHAR, a.d_update, 120) AS d_update
						,a.i_enable
					INTO #tempData
					FROM cm_voucher_one a
					WHERE ISNULL(a.cm_pay_type_id,0)>0
						AND a.i_enable=1
						AND a.c_code_pv LIKE 'PV%'
						AND a.c_code_pv NOT IN (SELECT c_ref_doc FROM gl_tran_hdr WHERE i_enable=1 AND ISNULL(c_ref_doc,'0') LIKE 'PV%' AND LEFT(c_code,1)='G')
						AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$date_start}',102) AND CONVERT(DATETIME,'{$date_end}'+' 23:59:59',102)
						{$con}

					SELECT * FROM #tempData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

					SELECT COUNT(*) AS rowCounts FROM #tempData;";
		
		$arrParam[]	= $start;
		$arrParam[]	= $limit;

		$stmt = $db->QueryParam( $sqlMain, $arrParam );
		if( sqlsrv_has_rows($stmt) ) {
			while( $row=$db->Fetch( $stmt ) ) {

				$temp = array(	"no"					=> $row["numrow"],
								"id"					=> $row["cm_voucher_one_id"],
								"c_code_pv"				=> $row["c_code_pv"],
								"c_code_gx"				=> $row["c_code_gx"],
								"i_type_voucher"		=> $row["i_type_voucher"],
								"name_voucher"			=> $FI_I_TYPE_VOUCHER_ARR[$row["i_type_voucher"]],
								"c_code_ap"				=> $row["c_code_ap"],
								"d_doc_date_pv"			=> $date->extDateBuddha($row["d_doc_date_pv"]),
								"c_code"				=> $row["c_code"],
								"d_doc_date"			=> $date->extDateBuddha($row["d_doc_date"]),
								"name_cash_type"		=> $row["name_cash_type"],
								"f_net_cost"			=> $row["f_net_cost"],
								"dc_user_create"		=> $row["dc_user_create"],
								"dc_user_create_cost"	=> $row["dc_user_create_cost"],
								"d_create"				=> $date->extDateBuddha($row["d_create"]),
								"dc_user_update"		=> $row["dc_user_update"],
								"dc_user_update_cost"	=> $row["dc_user_update_cost"],
								"d_update"				=> $date->extDateBuddha($row["d_update"]),
								"i_enable"				=> $row["i_enable"]
				);
				${$root}[] = $temp;
			}
		}
		
		$db->NextResult( $stmt );
		$rowCounts=$db->Fetch( $stmt );
		echo json_encode(array("debug"=>true,"totalCount"=>$rowCounts["rowCounts"],$root=>${$root}));
		
	break;
	
	case "dataGL" :
		
		$c_ref_doc		= @$_REQUEST["c_ref_doc"];
		$d_doc_date1 	= substr(@$_REQUEST["d_doc_date1"],0,10);
		$d_doc_date2 	= substr(@$_REQUEST["d_doc_date2"],0,10);
		
		$arrParam[] = STATUS_ENABLE;
		$arrParam[] = BOOK_ACC_NOT_POST;
		$arrParam[]	= ($d_doc_date1 == "")? date("Y-m-d", mktime(0,0,0,(date("m")-2),1,date("Y"))) : $d_doc_date1;
		$arrParam[]	= ($d_doc_date2 == "")? date("Y-m-d") : $d_doc_date2;
		$arrParam[]	= $start;
		$arrParam[]	= $limit;
		
		$strWhere = "";
		if ( $c_ref_doc != "" ) {
			$strWhere .= " and c_ref_doc like ? ";
			$arrParam[]	= "%{$c_ref_doc}%";
		}
		
		$sqlMain = "SET NOCOUNT ON
					DECLARE @iEnable as tinyint;
					DECLARE @iPost as tinyint;
					DECLARE @date_start as varchar(10);
					DECLARE @date_end as varchar(10);
					DECLARE @row_start as int;
					DECLARE @row_end as int;
					
					SET @iEnable = ?;
					SET @iPost = ?;
					SET @date_start = ?;
					SET @date_end = ?;
					SET @row_start = ?;
					SET @row_end = ?;
					
					DECLARE @tbl_gl_tran_hdr as table (row_id int identity(1, 1)
																, gl_tran_hdr_id bigint
																, gl_dc_book_type_id bigint
																, c_code varchar(50)
																, c_code_post varchar(255)
																, c_ref_doc varchar(50)
																, c_mm varchar(255)
																, c_yyyy varchar(255)
																, i_status tinyint
																, d_save_date datetime
																, d_doc_date datetime
																, i_is_reversing tinyint
																, i_is_close_year tinyint
																, i_type tinyint
																, i_is_post tinyint
																, i_preview tinyint
																, i_enable tinyint
																, c_create_name varchar(255)
																, c_cost_creat_name varchar(255)
																, d_create datetime
																, c_update_name varchar(255)
																, c_cost_update_name varchar(255)
																, d_update datetime
																, f_total_amt decimal(18, 2)
																, c_comment1 varchar(255)
																, c_comment2 varchar(255)
																, c_comment3 varchar(255)
															);
					
					insert into @tbl_gl_tran_hdr
					select
						gl_tran_hdr_id,
						gl_dc_book_type_id,
						c_code,
						c_code_post,
						c_ref_doc,
						c_mm,
						c_yyyy,
						(SELECT i_status FROM gl_dc_period WHERE i_system = 1 AND i_last_period = 1 AND c_mm = gl_tran_hdr.c_mm AND c_yyyy = gl_tran_hdr.c_yyyy) AS i_status,
						convert(VARCHAR, d_save_date, 120)as d_save_date,
						convert(VARCHAR, d_doc_date, 120) as d_doc_date,
						i_is_reversing,
						i_is_close_year,
						i_type,
						i_is_post,
						i_preview,
						i_enable
						,(select top 1 c_full_name from dc_user where dc_user_id=gl_tran_hdr.dc_user_create_id) as c_create_name
						,(select top 1 c_name from dc_cost where dc_cost_id=gl_tran_hdr.dc_user_create_cost_id) as c_cost_creat_name
						, convert(varchar, d_create, 120) as d_create
						,(select top 1 c_full_name from dc_user where dc_user_id=gl_tran_hdr.dc_user_update_id) as c_update_name
						,(select top 1 c_name from dc_cost where dc_cost_id=gl_tran_hdr.dc_user_update_cost_id) as c_cost_update_name
						, convert(varchar, [d_update], 120) as d_update 
						, f_total_amt
						, left(c_comment1,50) as c_comment1
						, c_comment2
						, c_comment3
					FROM gl_tran_hdr
					WHERE left(c_ref_doc,2)='PV' AND left(c_ref_doc, 3)!='PVP'
							and d_doc_date between CONVERT(DATETIME,@date_start,102) and CONVERT(DATETIME,@date_end+' 23:59:59',102)
							and i_enable= @iEnable
							and i_is_post = @iPost
							{$strWhere}
					order by c_ref_doc;
					
					select row_id,
							gl_tran_hdr_id,
							gl_dc_book_type_id,
							c_code,
							c_code_post,
							c_ref_doc,
							c_mm,
							c_yyyy,
							i_status,
							isnull(convert(VARCHAR, d_save_date, 120), '') as d_save_date,
							isnull(convert(VARCHAR, d_doc_date, 120), '') as d_doc_date,
							i_is_reversing,
							i_is_close_year,
							i_type,
							i_is_post,
							i_preview,
							i_enable
							, c_create_name
							, c_cost_creat_name
							, isnull(convert(varchar, d_create, 120),'') as d_create
							, c_update_name
							, c_cost_update_name
							, isnull(convert(varchar, [d_update], 120),'') as d_update 
							, f_total_amt
							, c_comment1
							, c_comment2
							, c_comment3
						from @tbl_gl_tran_hdr where row_id between @row_start and @row_end;
					
					select count(*) as rowCounts from @tbl_gl_tran_hdr;";

		$stmt = $db->QueryParam($sqlMain, $arrParam);
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(	"no" 						=> $row["row_id"],
							"id"						=> $row["gl_tran_hdr_id"],
							"gl_dc_book_type_id"			=> $row["gl_dc_book_type_id"],
							"c_code"					=> $row["c_code"],
							"c_code_post"				=> $row["c_code_post"],
							"c_ref_doc"					=> $row["c_ref_doc"],
							"c_mm"						=> $row["c_mm"],
							"c_yyyy"					=> $row["c_yyyy"],
							"i_status"					=> $row["i_status"],
							"d_save_date"				=> ($row["d_save_date"] != "")? $date->extDateBuddha($row["d_save_date"]) : "",
							"d_doc_date"				=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"i_is_reversing"			=> $row["i_is_reversing"],
							"i_is_close_year"			=> $row["i_is_close_year"],
							"i_type"					=> $row["i_type"],
							"i_is_post"					=> $row["i_is_post"],
							"i_preview"					=> $row["i_preview"],
							"i_enable"					=> $row["i_enable"],
							"dc_user_create_id" 		=> $row["c_create_name"],
							"dc_user_create_cost_id" 	=> $row["c_cost_creat_name"],
							"d_create" 					=> ($row["d_create"] != "")? $date->extDateBuddha($row["d_create"]) : "",
							"dc_user_update_id" 		=> $row["c_update_name"],
							"dc_user_update_cost_id" 	=> $row["c_cost_update_name"],
							"d_update" 					=> ($row["d_update"] != "")? $date->extDateBuddha($row["d_update"]) : "",
							"f_money_dtl"				=> $row["f_total_amt"],
							"c_comment1"				=> $row["c_comment1"],
							"c_comment2"				=> $row["c_comment2"],
							"c_comment3"				=> $row["c_comment3"]
				);
			${$root}[] = $temp;
		}
		$db->NextResult($stmt);
		$rowCounts =$db->Fetch($stmt);
		echo json_encode(array("debug"=>true,"totalCount"=>$rowCounts["rowCounts"],$root=>${$root}));
		
	break;
}
?>
