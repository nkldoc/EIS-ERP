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
	$arr_qry		= array($_REQUEST["year"]) ;
	// ========================================================================================== //
 
	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						a.c_mm
						,a.c_yyyy
						,a.c_period
						,a.c_yyyy_mm
						,a.c_post
						,a.c_close_year
						,a.c_status
						,a.i_is_post
						,a.i_is_close_year
						,a.i_status
						,a.dc_user_create_id
						,a.dc_user_create_cost_id
						,a.d_create
						,a.c_user_create_name 
					FROM vw_gl_process a
					WHERE a.c_year_budget=?
					ORDER BY a.c_mm asc;
					";
 	$stmt = $db->QueryParam( $sqlMain,$arr_qry);
	 
	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
			$temp["no"]								= $idx;
 			$temp["c_mm"]							= $row["c_mm"];
			$temp["c_yyyy"]							= $row["c_yyyy"]; 
			$temp["c_period"]						= $row["c_period"]; 
			$temp["c_yyyy_mm"]						= $row["c_yyyy_mm"];  
			$temp["c_post"]							= $row["c_post"];  
			$temp["c_close_year"]					= $row["c_close_year"];  
 			$temp["i_is_close_year"]				= $row["i_is_close_year"];  
  			$temp["i_status"]						= $row["i_status"];  
			$temp["c_user_create_name"]				= $row["c_user_create_name"];			
		 
			${$root}[]	= $temp;
			$totalCount++;
			$idx++;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
 

?>
