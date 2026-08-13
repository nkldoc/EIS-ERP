<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php"); 
include("../conf/configGl.php");

$db 		= new DatabaseServer(); 

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam() {
	
	global $db,$root,$data, $con,$ARR_GL_CFG_TEXT,$arr_status;
 
	$totalCount		= 0;
	$idx			= 1;

	// ========================================================================================== //
 	if( $_REQUEST["i_enable"] > 0 ) { $con .= " AND a.i_enable=".$_REQUEST["i_enable"]; }
	
	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						a.gl_dc_config_id
						,a.c_name
						,(select b.c_code+' '+b.c_name from vw_dc_acc b where b.dc_acc_id=a.dc_acc_id)   as c_acc_show
						,(select c.c_code+' '+c.c_name from vw_dc_cost c where c.dc_cost_id=a.dc_acc_id) as c_cost_show
						,isnull(a.i_config,0) as i_config
						,a.i_enable
						,a.c_comment
					FROM vw_gl_dc_config a
					WHERE 1=1	{$con}
					ORDER BY a.gl_dc_config_id;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
			$temp["no"]								= $idx;
			$temp["gl_dc_config_id"]				= $row["gl_dc_config_id"]; 
			$temp["c_name"]							= $row["c_name"];
			$temp["c_acc_show"]						= $row["c_acc_show"];
			$temp["c_cost_show"]					= $row["c_cost_show"];
		 	$temp["c_config_name"]					= $ARR_GL_CFG_TEXT[$row["i_config"]];
		 	$temp["c_enable_name"]					= $arr_status[$row["i_enable"]];
		 	$temp["c_comment"]						= $row["c_comment"];
 
			${$root}[]	= $temp;
			$totalCount++;
			$idx++;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
 

?>
