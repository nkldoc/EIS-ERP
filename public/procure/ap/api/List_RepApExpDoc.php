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
  
function List_QueryParam() {

	global $db, $date, $util, $root, $data, $con;
	
	$totalCount		= 0;
	
	$i_enable		= @$_REQUEST["i_enable"];
	$start 			= @$_REQUEST["start"];
	$limit 			= @$_REQUEST["limit"];
	$dir			= @$_REQUEST["dir"];
	$sort			= @$_REQUEST["sort"];
	
	if (!get($start))	{ $start 	= 0; }
	if (!get($limit))	{ $limit 	= 20; }else{ $limit=($limit+$start); }
	if (!get($dir))		{ $dir		= "ASC"; }
	if (!get($sort))	{ $sort		= "c_name"; }

if($i_enable > 0) {
	$con	= " AND a.i_enable = $i_enable ";
}
 		
	 
	//--------------------------------------------------------------------------------------//
$sqlTempTable = "	SELECT
						ROW_NUMBER() OVER (ORDER BY $sort $dir) AS no,
						ap_exp_doc_id,
						c_code,
						c_name,						
						i_type,
						i_exp_type,
						i_enable,
	                    case 
	                    	when (a.i_exp_type=1) then 'ใบรายจ่ายพิเศษ'
	                    	when (a.i_exp_type=2) then 'อื่นๆ'
	                    	else '-'
	                    end as c_exp_type_name,
						dc_user_create_id,
						dc_user_create_cost_id,
						convert(VARCHAR, a.d_create, 120) AS d_create,
						dc_user_update_id,
						dc_user_update_cost_id,
						convert(VARCHAR, a.d_update, 120) AS d_update
					FROM vw_ap_exp_doc a
					WHERE 1 = 1 $con";

$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.no > ? AND a.no <= ?;
			SELECT COUNT(*) AS rowCounts FROM ({$sqlTempTable}) a;";
	 
 
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
 
//	print_r($arrParam); echo "<hr><br>$sqlMain"; exit;
	$stmt = $db->QueryParam($sqlMain,$arrParam);
	if( $stmt ) {
		
			while($row =$db->Fetch($stmt))				
			{
				$totalCount++;

				$temp = array(	"no"					=> $row["no"],
								"id"					=> $row["ap_exp_doc_id"],
								"c_code"				=> $row["c_code"],
								"c_name"				=> $row["c_name"],
								"i_type"				=> $row["i_type"],
								"i_exp_type"			=> $row["i_exp_type"],
								"i_enable"				=> $row["i_enable"],
								"c_exp_type_name"		=> $row["c_exp_type_name"],
								"dc_user_create_id"		=> $row["dc_user_create_id"],
								"dc_user_create_cost_id"=> $row["dc_user_create_cost_id"],
								"d_create"				=> $row["d_create"],
								"dc_user_update_id"		=> $row["dc_user_update_id"],
								"dc_user_update_cost_id"=> $row["dc_user_update_cost_id"],
								"d_update"				=> $row["d_update"]
				 );
				${$root}[] = $temp;
			}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root} ));
}
function get($a){ return isset($a) && !empty($a)?$a:null; }

if($_REQUEST["type"] == "data") { echo List_QueryParam();exit; }
?>
