<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php"); 
include("../../gl/conf/configGl.php");
include("../conf/config_am.php");
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
$i_read	= @$_REQUEST["i_read"];

if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
if (!$util->get($dir)) { 	$dir	= "ASC"; }
if (!$util->get($sort)) { 	$sort	= "a.c_code"; }

switch( $type ) {
	
	case "dataAD" :
		$arrParam = array();
		$arrCountParam =  array();
		
		$filter 		= @$_REQUEST["filter"];
		$value			= @$_REQUEST["value"];
		$d_doc_date1 	= (!get(@$_REQUEST["d_doc_date1"])) ? date("Y-m-d", mktime(0, 0, 0, (date('m')-1), 1, date('Y'))) : substr($_REQUEST["d_doc_date1"],0, 10);
		$d_doc_date2 	= (!get(@$_REQUEST["d_doc_date2"])) ? date("Y-m-d") : substr($_REQUEST["d_doc_date2"],0, 10);
		
		$arrParam[] = STATUS_ENABLE;
		$arrCountParam[]= STATUS_ENABLE;

		$arrParam[]	= $d_doc_date1;
		$arrCountParam[]=$d_doc_date1;
		$arrParam[]	= $d_doc_date2;
		$arrCountParam[]=$d_doc_date2;

		$sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY a.c_code desc) as row_id
							, a.gl_tran_hdr_id
							, a.c_code
							, a.c_ref_doc
							, isnull(convert(varchar(10),a.d_save_date, 120), '') as d_save_date
							, a.c_comment1 as c_comment
						from gl_tran_hdr a
						where left(c_ref_doc,2)='AD'
							and left(c_code,1)='G'
							and i_enable=?
							and d_save_date between CONVERT(DATETIME,?,102) and CONVERT(DATETIME,?+' 23:59:59',102)"
						.$util->viewAcc($i_read);
		
		//===================================//
		if ($filter != "" && $value != "") {
			$sqlTempTable .= " and a.{$filter} like ? ";
			$arrParam[]	= "%{$value}%";
			$arrCountParam[]	= "%{$value}%";
		}

		//===================================//
		

		$arrParam[] = $start;
		$arrParam[] = $limit;
		$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row_id > ? and a.row_id <= ?";
		$stmt = $db->QueryParam( $sqlMain, $arrParam );
		while( $row=$db->Fetch( $stmt ) ) {
			
			$temp = array(	"no"					=> $row["row_id"],
							"id"					=> $row["gl_tran_hdr_id"],
							"c_code"				=> $row["c_code"],
							"c_ref_doc"				=> $row["c_ref_doc"],
							"d_save_date"			=> ($row["d_save_date"] != "")?$date->extDateBuddha($row["d_save_date"]) : "",
							"c_comment"				=> $row["c_comment"],
			);
			${$root}[] = $temp;
		}
		
		$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
		echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
		exit;
		
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
					WHERE left(c_ref_doc,2)='AD'
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
function get($a){ return isset($a) && !empty($a)?$a:null; }
?>