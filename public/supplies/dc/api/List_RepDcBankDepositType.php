<?php
include("../../conf/config.php");
include("../conf/configDc.php");
include("../../lib/database/DatabaseServer.php"); 
include("../../lib/date/i_date.class.php");

$db 		= new DatabaseServer();
$date		= new i_date();

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam() {
	
	global $db, $date, $root, $data, $con, $arr_status;
 
	$totalCount		= 0;
	
	if($_REQUEST["i_enable"] > 0) { $con .= " AND a.i_enable = ".$_REQUEST["i_enable"]; }
	if($_REQUEST["i_main"] > 0) { $con .= " AND a.i_main = ".$_REQUEST["i_main"]; }
	
	$sqlMain = "SELECT * FROM dc_bank_deposit_type a
				WHERE a.i_delete = ".DELETE_FALSE."
					{$con}
				ORDER BY a.c_code;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			
			$temp		= array();
	
			$temp["no"]					= ++$totalCount;
			$temp["c_code"]				= $row["c_code"];
			$temp["c_name"]				= $row["c_name"];
			$temp["c_comment"]			= $row["c_comment"];
			$temp["i_enable"]			= $row["i_enable"];
			$temp["i_main"]				= $row["i_main"];
			$temp["i_type"]				= $row["i_type"];				
			${$root}[]	= $temp;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
