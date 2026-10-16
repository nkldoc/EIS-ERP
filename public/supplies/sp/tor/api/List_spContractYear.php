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
if ($_REQUEST["type"] == "sp_Contract_Year") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) {
		$start 	= 0;
	}
	if (!$util->get($limit)) {
		$limit 	= 20;
	} else {
		$limit = ($limit + $start);
	}

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	} 

	// if ($mode == "SEARCH") {
	// 	if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
	// 		$con .= " AND a.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
	// 	}
	// 	if ($_REQUEST["i_budget_year"] > 0) {
	// 		$con .= " AND a.i_year=" . $_REQUEST["i_budget_year"];
	// 	}
	// }

	$sql = "		
		DECLARE @i_year_max INT;
		DECLARE @i_year_now INT;
		SET @i_year_now =  YEAR(GETDATE());
		SET @i_year_max  = (SELECT ISNULL(MAX(i_year_ad), 0) FROM sp_contract_year);

		IF @i_year_now >= @i_year_max
		BEGIN
			INSERT INTO sp_contract_year (
				i_year_ad
				,i_year_be
				,d_start
				,d_stop
				,i_status
				,i_enabled
				,dc_user_create_id
				,dc_user_create_cost_id
				,d_create
				,dc_user_update_id
				,dc_user_update_cost_id
				,d_update
			) VALUES (
				@i_year_max+1
				,@i_year_max+1+543
				,null
				,null
				,2
				,2
				,{$_SESSION["user_id"]}
				,{$_SESSION["dc_cost_id"]}
				,GETDATE()
				,{$_SESSION["user_id"]}
				,{$_SESSION["dc_cost_id"]}
				,GETDATE()
			);
		END";
	$stmt = $db->QueryParam($sql, array());

	$sqlMain = "SET NOCOUNT ON		
					SELECT
						ROW_NUMBER() OVER (ORDER BY a.sp_contract_year_id DESC) AS numrow
						,a.sp_contract_year_id
					INTO #TemData
					FROM dbo.sp_contract_year a  ;

					
					SELECT
						a.numrow
						,b.sp_contract_year_id
						,b.i_year_ad
						,b.i_year_be
						,CONVERT(VARCHAR, b.d_start, 120) AS d_start
						,CONVERT(VARCHAR, b.d_stop, 120) AS d_stop
						,b.i_status
						,b.i_enabled
						,CONVERT(VARCHAR, b.d_update, 120) AS d_update        
						,CONVERT(VARCHAR, b.d_create, 120) AS d_create        
						,(select top 1 c_full_name from dc_user where dc_user_update_id = b.dc_user_update_id) as dc_user_update
						,(select top 1 c_name from dc_cost where dc_cost_id = b.dc_user_update_cost_id) as dc_user_cost_update
						,(select top 1 isnull(c_gen,0) from sp_doc_gen where c_yyyy = b.i_year_be and dc_doc_id = 1 ORDER by i_value desc ) as purchase_order 
                        ,(select top 1 isnull(c_gen,0) from sp_doc_gen where c_yyyy = b.i_year_be and dc_doc_id = 2 ORDER by i_value desc ) as employment_order
                        ,(select top 1 isnull(c_gen,0) from sp_doc_gen where c_yyyy = b.i_year_be and dc_doc_id = 3 ORDER by i_value desc ) as rental_order
                        ,(select top 1 isnull(c_gen,0) from sp_doc_gen where c_yyyy = b.i_year_be and dc_doc_id = 4 ORDER by i_value desc ) as purchase_contract
                        ,(select top 1 isnull(c_gen,0) from sp_doc_gen where c_yyyy = b.i_year_be and dc_doc_id = 5 ORDER by i_value desc ) as employment_contract
                        ,(select top 1 isnull(c_gen,0) from sp_doc_gen where c_yyyy = b.i_year_be and dc_doc_id = 6 ORDER by i_value desc ) as rental_contract
					FROM #TemData a
					INNER JOIN dbo.sp_contract_year b ON a.sp_contract_year_id = b.sp_contract_year_id
        WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"					=>	$row["numrow"],
				"id"					=>	$row["sp_contract_year_id"],
				"i_year_ad"				=>	$row["i_year_ad"],
				"i_year_be"				=>	$row["i_year_be"],
				"purchase_order"		=>	$row["purchase_order"],
				"employment_order"		=>	$row["employment_order"],
				"rental_order"			=>	$row["rental_order"],
				"purchase_contract"		=>	$row["purchase_contract"],
				"employment_contract"	=>	$row["employment_contract"],
				"rental_contract"		=>	$row["rental_contract"],
				"d_start"				=> ($row["d_start"] != "") ? $date->extDateBuddha($row["d_start"]) : "",
				"d_stop"				=> ($row["d_stop"] != "") ? $date->extDateBuddha($row["d_stop"]) : "",
				"i_status"				=>	$row["i_status"],
				"i_enabled"				=>	$row["i_enabled"],
				"d_create" 				=> ($row["d_create"] != "") ? $date->extDateBuddha($row["d_create"]) : "",
				"d_update" 				=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
				"dc_user_update"		=>	$row["dc_user_update"],
				"dc_user_cost_update"	=>	$row["dc_user_cost_update"],
				// "c_log_status"			=>	$row["c_log_status"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}