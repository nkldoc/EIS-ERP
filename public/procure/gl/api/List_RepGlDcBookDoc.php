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
						a.gl_dc_book_doc_id
						,a.c_doc_code
						,a.c_name  
						,a.i_enable
						,a.c_comment
					FROM vw_gl_dc_book_doc a
					WHERE 1=1	{$con}
					ORDER BY a.gl_dc_book_doc_id;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
			$temp["no"]								= $idx;
			$temp["gl_dc_book_doc_id"]				= $row["gl_dc_book_doc_id"]; 
			$temp["c_doc_code"]						= $row["c_doc_code"];  
			$temp["c_name"]							= $row["c_name"]; 
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
