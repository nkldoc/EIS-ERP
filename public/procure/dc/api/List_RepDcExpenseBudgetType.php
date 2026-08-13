<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php"); 
include("../../lib/date/i_date.class.php");
include("../conf/configDc.php");

$db 		= new DatabaseServer();
$date		= new i_date();

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam() {
	
	global $db, $date, $root, $data, $con, $arr_status,$CONF_I_TYPE_DC_BG;
 
	$totalCount		= 0;
	
	if($_REQUEST["i_enable"] > 0) { $con .= " AND a.i_enable = ".$_REQUEST["i_enable"]; } 
	
	$sqlMain = "SET NOCOUNT ON
				SELECT a.* FROM dc_expense_budget_type a
				WHERE i_delete = ".DELETE_FALSE."
					{$con}
				ORDER BY c_code;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"				=> ++$totalCount,
							"c_code"			=> $row["c_code"], 
							"c_name"			=> $row["c_name"], 
							"i_enable"			=> $row["i_enable"],
							"c_comment"			=> $row["c_comment"],
							// "i_type"			=> $row["i_type"],
							// "c_type"			=> $CONF_I_TYPE_DC_BG[$row["i_type"]]
							);
			
			${$root}[] = $temp;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
