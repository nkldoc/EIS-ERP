<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php"); 
include("../../lib/date/i_date.class.php");
include("../conf/configGl.php");

$db 		= new DatabaseServer(); 
$idate 		= new i_date();
$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam() {
	
	global $db,$root,$data, $con,$ARR_GL_CFG_TEXT,$arr_status,$idate;
 
	$totalCount		= 0;
	$idx			= 1;

	// ========================================================================================== //
 
	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						a.gl_dc_period_id
						,a.c_mm 
						,a.c_yyyy+543 as c_yyyy_thai
						,a.i_status 
						,a.c_status 
						,a.i_last_period
						,a.dc_user_create_id
						,a.dc_user_create_cost_id 
						,CONVERT(VARCHAR, a.d_create, 120) AS d_create
						,(select b.c_name from vw_dc_user_show_name b where b.dc_user_id=a.dc_user_create_id) as c_full_name
						,RIGHT(CONVERT(VARCHAR, a.d_create, 120),8) as c_time
					FROM vw_gl_dc_period a
					WHERE a.i_system=? AND a.c_yyyy=?
					ORDER BY a.c_mm asc,a.i_last_period asc;
					";

	$stmt = $db->QueryParam( $sqlMain, array(GL_PERIOD_SYSTEM_AR,$_REQUEST["year"]) );
	
	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
			$temp["no"]								= $idx;
			$temp["gl_dc_period_id"]				= $row["gl_dc_period_id"];  
			$temp["c_mm"]							= $row["c_mm"];
			$temp["c_yyyy"]							= $row["c_yyyy_thai"];   
			$temp["i_status"]						= $row["i_status"];  
			$temp["c_status"]						= $row["c_status"];  
 			$temp["i_last_period"]					= $row["i_last_period"];  
			$temp["dc_user_create_id"]				= $row["dc_user_create_id"];  
			$temp["dc_user_create_cost_id"]			= $row["dc_user_create_cost_id"];  
			$temp["d_create"]						= $idate->shot_date_from_db($row["d_create"],true,"-");
			$temp["c_full_name"]					= $row["c_full_name"];			
			$temp["c_time"]							= $row["c_time"];			
 
			${$root}[]	= $temp;
			$totalCount++;
			$idx++;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
 

?>
