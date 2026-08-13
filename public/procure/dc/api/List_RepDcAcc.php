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
 	if( $_REQUEST["i_group"] > 0 )  { $con .= " AND aa.i_group=".$_REQUEST["i_group"]; 		}
 	if( $_REQUEST["i_last"] > 0 )   { $con .= " AND aa.i_last=".$_REQUEST["i_last"]; 		}
 	if( $_REQUEST["i_enable"] > 0 ) { $con .= " AND aa.i_enable=".$_REQUEST["i_enable"]; 	}
	
	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						ROW_NUMBER() OVER (ORDER BY aa.c_code_tree) AS [row],
						aa.dc_acc_id,
						aa.c_code+' '+aa.c_name AS c_full,
						(SELECT bb.c_name FROM vw_dc_cost bb WHERE bb.dc_cost_id=aa.dc_cost_acc_id_fixed) AS c_cost_acc_name,
						aa.i_last,
						aa.i_level,
						aa.i_debit,
						aa.i_enable
					FROM vw_dc_acc aa
					WHERE 1=1	{$con}
					ORDER BY aa.c_code asc;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
			$temp["no"]								= $idx;
			$temp["dc_acc_id"]						= $row["dc_acc_id"]; 
			$temp["c_full"]							= $row["c_full"];  
			$temp["c_cost_acc_name"]				= $row["c_cost_acc_name"];  
		 	$temp["c_enable_name"]					= $arr_status[$row["i_enable"]]; 
 			$temp["i_last"]							= $row["i_last"];   
			$temp["i_level"]						= $row["i_level"];   
			$temp["i_debit"]						= $row["i_debit"];    

			${$root}[]	= $temp;
			$totalCount++;
			$idx++;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
 

?>
