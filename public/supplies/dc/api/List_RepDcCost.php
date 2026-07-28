<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php"); 
include("../../gl/conf/configGl.php");

$db 		= new DatabaseServer(); 

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam() {
	
	global $db,$root,$data, $con,$ARR_GL_CFG_TEXT,$arr_status;
 
	$totalCount		= 0;
	$idx			= 1;

	// ========================================================================================== // 
 	if( $_REQUEST["i_enable"] > 0 ) { $con .= " AND aa.i_enable=".$_REQUEST["i_enable"]; 	}
	
	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						ROW_NUMBER() OVER (ORDER BY aa.c_code_tree) AS [row],
						aa.dc_cost_id,
						aa.c_code+' '+aa.c_name AS c_full,
						aa.i_last,
						aa.i_level, 
						aa.i_enable,
						(select ar.c_name from dc_area ar where ar.dc_area_id=aa.dc_area_id) as c_area_name,
						(select ct.c_name from dc_cost ct where ct.dc_cost_id=aa.dc_cost_acc_id) as c_cost_acc_name
					FROM dc_cost aa
					WHERE 1=1	{$con}
					ORDER BY aa.c_code asc;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
 	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {

			$temp["no"]								= $idx;
			$temp["dc_cost_id"]						= $row["dc_cost_id"]; 
			$temp["c_full"]							= $row["c_full"];  
 			$temp["i_last"]							= $row["i_last"];   
			$temp["i_level"]						= $row["i_level"];    
			$temp["c_enable_name"]					= $arr_status[$row["i_enable"]]; 
			$temp["c_area_name"]					= $row["c_area_name"];
			$temp["c_cost_acc_name"]				= $row["c_cost_acc_name"]; 

			${$root}[]	= $temp;
			$totalCount++;
			$idx++;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
 

?>
