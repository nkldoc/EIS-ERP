<?php
include("../conf/configGl.php");
include("../../conf/config.php");
include("../../ap/conf/configAp.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php"); 
###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
#########################

$root		= "data";
$data		= array();
$arrParam 	= array();

$type 	= @$_REQUEST["type"];
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"];

if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
if (!$util->get($dir)) { 	$dir	= "ASC"; }
if (!$util->get($sort)) { 	$sort	= "a.c_code"; }

switch( $type ) {
	
	case "dataAP" :
		
		$filter 		= @$_REQUEST["filter"];
		$value			= @$_REQUEST["value"];
		$d_doc_date1 	= @$_REQUEST["d_doc_date1"];
		$d_doc_date2 	= @$_REQUEST["d_doc_date2"];
		$dc_cost_id 	= @$_REQUEST["dc_cost_id"];
		$sMonth 		= @$_REQUEST["sMonth"];
		$sYear 			= @$_REQUEST["sYear"];
		$eMonth 		= @$_REQUEST["eMonth"];
		$eYear 			= @$_REQUEST["eYear"];
		$i_enable		= @$_REQUEST["i_enable"];

		$arrParam[]	= ( $d_doc_date1 == "" )? date("Y-m-d", mktime(0,0,0,(date("m")-2),1,date("Y"))) : $d_doc_date1;
		$arrParam[]	= ( $d_doc_date2 == "" )? date("Y-m-d") : $d_doc_date2;
		$arrParam[]	= $start;
		$arrParam[]	= $limit;

		//===================================//
		$strWhere = "";
		if ($filter != "" && $value != "") {
			$strWhere .= " and a.{$filter} like ? ";
			$arrParam[]	= "%{$value}%";
		}

		if ( $dc_cost_id > 0 ) {
			$strWhere .= " and a.dc_cost_id = ?";
			$arrParam[]	= $dc_cost_id;
		}

		if ( $sMonth != "" && $sYear != "" && $eMonth != "" && $eYear != "" ) {
			$strWhere .= " AND a.c_yyyy_mm between (CAST({$sYear} AS varchar(4))+CAST(RIGHT('0'+CAST({$sMonth} AS varchar(2)),2) AS varchar(2)))
								AND (CAST({$eYear} AS varchar(4))+CAST(RIGHT('0'+CAST({$eMonth} AS varchar(2)),2) AS varchar(2)))";
		}
		
		if ( $i_enable == STATUS_ENABLE || $i_enable == STATUS_DISABLE ) {
			$strWhere .= " and a.i_enable = ?";
			$arrParam[] = $i_enable;
		}
		//===================================//
		$sqlMain = "SET NOCOUNT ON
					DECLARE @date_start as varchar(10);
					DECLARE @date_end as varchar(10);
					DECLARE @row_start as int;
					DECLARE @row_end as int;

					SET @date_start = ?;
					SET @date_end = ?;
					SET @row_start = ?;
					SET @row_end = ?;

					DECLARE @tbl_ap_expen_hdr as table (row_id int identity(1, 1)
															, ap_expen_hdr_id bigint
															, c_code varchar(50)
															, c_name varchar(255)
															, cnt_name varchar(255)
															, gl_dc_book_type_id tinyint
															, c_doc_ref varchar(255)
															, cost_ap_name varchar(255)
															, i_is_barter int
															, i_is_salary int
															, i_send_tax int
															, i_is_status int
															, d_chk_date datetime
															, d_doc_date datetime
															, c_yyyy_mm varchar(6)
															, f_net_penalty decimal(18,2)
															, f_barter_amt decimal(18,2)
															, f_net_amount decimal(18,2)
															, i_enable tinyint
															, dc_user_create_id bigint
															, dc_user_create_cost_id bigint
															, d_create datetime
															, dc_user_update_id bigint
															, dc_user_update_cost_id bigint
															, d_update datetime
															, dtl_id bigint);

					INSERT INTO @tbl_ap_expen_hdr
					SELECT a.ap_expen_hdr_id
						,a.c_code
						,a.c_name
						,CASE
							WHEN ((a.i_type_person=".PERSON_CREDITOR.") AND (a.dc_creditor_id>0)) THEN (SELECT c_name FROM dbo.vw_dc_creditor WHERE dc_creditor_id=a.dc_creditor_id)
							WHEN ((a.i_type_person=".PERSON_EMP.") AND (a.dc_emp_id>0)) THEN (SELECT c_name FROM dc_emp WHERE dc_emp_id=a.dc_emp_id)
							WHEN ((a.i_type_person=".PERSON_OTHER.") AND (a.c_other_name!='')) THEN a.c_other_name
							ELSE ''
						END AS cnt_name
						,(SELECT TOP 1 ISNULL(gl_dc_book_type_id,0) FROM gl_dc_book_type WHERE c_code=substring(a.c_code,1,2)) AS gl_book_type_id
						,a.c_doc_ref
						,(SELECT c_name FROM dc_cost WHERE dc_cost_id = a.dc_cost_id) AS cost_ap_name
						,a.i_is_barter
						,a.i_is_salary
						,a.i_send_tax
						,CASE WHEN a.i_is_status = 2 THEN 3 ELSE a.i_is_status END AS i_is_status
						,ISNULL(CONVERT(VARCHAR, a.d_chk_date, 120), '') AS d_chk_date
						,ISNULL(CONVERT(VARCHAR, a.d_doc_date, 120), '') AS d_doc_date
						,a.c_yyyy_mm
						,a.f_net_penalty
						,a.f_barter_amt
						,a.f_net_amount
						,a.i_enable
						,a.dc_user_create_id
						,a.dc_user_create_cost_id
						,a.d_create
						,a.dc_user_update_id
						,a.dc_user_update_cost_id
						,a.d_update
						,ISNULL((SELECT TOP 1 ap_expen_dtl_id FROM ap_expen_dtl WHERE ap_expen_hdr_id=a.ap_expen_hdr_id),0) AS dtl_id
					FROM ap_expen_hdr a
					WHERE a.d_doc_date BETWEEN CONVERT(DATETIME,@date_start,102) AND CONVERT(DATETIME,@date_end+' 23:59:59',102)
						AND a.c_code<>'0'
						AND a.i_is_status not in('0','-1')
						{$strWhere}
						AND a.c_code not in (SELECT c_ref_doc FROM gl_tran_hdr WHERE i_enable=1 and isnull(c_ref_doc,'0') like 'AP%'
						AND isnull(c_ref_doc,'0') not like 'APS%' and left(c_code,1)='G' )
					ORDER BY a.c_code DESC;

					SELECT a.row_id
						, a.ap_expen_hdr_id
						, a.c_code
						, a.c_name
						, a.cnt_name
						, a.gl_dc_book_type_id
						, a.c_doc_ref
						, a.cost_ap_name
						, a.i_is_barter
						, a.i_is_salary
						, a.i_send_tax
						, a.i_is_status
						, isnull(convert(VARCHAR, a.d_chk_date, 120), '') as d_chk_date
						, isnull(convert(VARCHAR, a.d_doc_date, 120), '') as d_doc_date
						, a.c_yyyy_mm
						, a.f_net_penalty
						, a.f_barter_amt
						, a.f_net_amount
						, a.i_enable
						, isnull(b.c_code_gx ,'ยังไม่บันทึกบัญชี') as c_code_gx
						, (SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
						, (SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
						, convert(VARCHAR, a.d_create, 120) AS d_create
						, (SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
						, (SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
						, convert(VARCHAR, a.d_update, 120) AS d_update
						, a.dtl_id
					FROM @tbl_ap_expen_hdr a
						LEFT JOIN (SELECT aa.c_ref_doc , CASE WHEN aa.c_code='0' THEN 'รายการรอลงบัญชี' WHEN left(aa.c_code,1)='G' THEN aa.c_code END as c_code_gx
									FROM gl_tran_hdr aa
										INNER JOIN @tbl_ap_expen_hdr bb on aa.c_ref_doc = bb.c_code
									WHERE left(aa.c_ref_doc, 2)='AP' and left(aa.c_ref_doc, 3) != 'APS'
										and aa.i_enable=1
									GROUP BY aa.c_ref_doc, aa.c_code) b on a.c_code = b.c_ref_doc
					WHERE a.row_id > @row_start AND a.row_id <= @row_end
					order by a.row_id;

					SELECT COUNT(*) AS rowCounts FROM @tbl_ap_expen_hdr;";

		$stmt = $db->QueryParam( $sqlMain, $arrParam );
		while( $row=$db->Fetch( $stmt ) ) {
			
			$mm		= substr($row["c_yyyy_mm"],-2);
			$yyyy	= substr($row["c_yyyy_mm"],0, 4);
			
			$temp = array(	"no"					=> $row["row_id"],
							"id"					=> $row["ap_expen_hdr_id"],
							"c_code"				=> $row["c_code"],
							"c_name"				=> $row["c_name"],
							"cnt_name"				=> $row["cnt_name"],
							"gl_dc_book_type_id"		=> $row["gl_dc_book_type_id"],
							"c_doc_ref"				=> $row["c_doc_ref"],
							"cost_ap_name"			=> $row["cost_ap_name"],
							"i_is_barter"			=> $row["i_is_barter"],
							"i_is_salary"			=> $row["i_is_salary"],
							"i_send_tax"			=> $row["i_send_tax"],
							"i_is_status"			=> $row["i_is_status"],
							"c_status_name"			=> $pay_status_arr[$row["i_is_status"]],
							"d_chk_date"			=> ($row["d_chk_date"] != "")?$date->extDateBuddha($row["d_chk_date"]) : "",
							"d_doc_date"			=> $date->extDateBuddha($row["d_doc_date"]),
							"c_yyyy_mm"				=> $date->l_month_thai[$mm]." ".($yyyy+543),
							"f_net_penalty"			=> $row["f_net_penalty"],
							"f_barter_amt"			=> $row["f_barter_amt"],
							"f_net_amount"			=> $row["f_net_amount"],
							"i_enable"				=> $row["i_enable"],
							"c_code_gx"				=> $row["c_code_gx"],
							"dc_user_create"		=> $row["dc_user_create"],
							"dc_user_create_cost"	=> $row["dc_user_create_cost"],
							"d_create"				=> $date->extDateBuddha($row["d_create"]),
							"dc_user_update"		=> $row["dc_user_update"],
							"dc_user_update_cost"	=> $row["dc_user_update_cost"],
							"d_update"				=> $date->extDateBuddha($row["d_update"]),
							"dtl_id"				=> $row["dtl_id"]
			);
			${$root}[] = $temp;
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
					WHERE left(c_ref_doc,3) not in ('APS') And left(c_ref_doc,2)='AP' 
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
							"gl_dc_book_type_id"		=> $row["gl_dc_book_type_id"],
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