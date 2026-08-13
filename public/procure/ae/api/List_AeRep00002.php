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
$select		= null;
$flds		= null;
$groupBy	= null;

function List_QueryParam() {
	
	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy, $arr_status;

	$totalCount		= 0;

	// ========================================================================================== //
	if( $_REQUEST["gl_dc_group_admin_hdr_id"] > 0 ) { $con .= " AND a.gl_dc_group_admin_hdr_id=".$_REQUEST["gl_dc_group_admin_hdr_id"]; }
	if( $_REQUEST["i_enable"] > 0 ) { $con .= " AND a.i_enable=".$_REQUEST["i_enable"]; }
	
	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						a.gl_dc_group_admin_hdr_id
						,a.c_code
						,a.c_name
						,a.i_enable
						,c.dc_cost_id
						,c.c_code AS cost_code
						,c.c_name AS cost_name
						,d.c_name AS cost_acc_name
					FROM gl_dc_group_admin_hdr a
						LEFT JOIN gl_dc_group_admin_dtl b ON a.gl_dc_group_admin_hdr_id = b.gl_dc_group_admin_hdr_id
						LEFT JOIN dc_cost c ON b.dc_cost_id = c.dc_cost_id
						LEFT JOIN (SELECT dc_cost_id, c_name FROM vw_dc_cost) d ON c.dc_cost_acc_id = d.dc_cost_id
					WHERE a.i_delete=".DELETE_FALSE."
					{$con}
					ORDER BY a.c_code, b.dc_cost_id;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
			
			$Arr1[$row["gl_dc_group_admin_hdr_id"]]["c_code"]	= $row["c_code"];
			$Arr1[$row["gl_dc_group_admin_hdr_id"]]["c_name"]	= $row["c_name"];
			$Arr1[$row["gl_dc_group_admin_hdr_id"]]["i_enable"]	= $row["i_enable"];
			
			$Arr2[$row["gl_dc_group_admin_hdr_id"]][$row["dc_cost_id"]]["cost_code"]		= $row["cost_code"];
			$Arr2[$row["gl_dc_group_admin_hdr_id"]][$row["dc_cost_id"]]["cost_name"]		= $row["cost_name"];
			$Arr2[$row["gl_dc_group_admin_hdr_id"]][$row["dc_cost_id"]]["cost_acc_name"]	= $row["cost_acc_name"];
			
			$totalCount++;
		}
		
		$no1	= 0;
		
		if(is_array(@$Arr1)) {
			
			foreach( $Arr1 AS $hdr_id => $obj1 ) {
					
				//=================================//
				$temp		= array();
				
				$no2		= 0;
				
				$temp["i_type"]				= 1;
				$temp["no"]					= ++$no1;
				$temp["c_code"]				= $obj1["c_code"];
				$temp["c_name"]				= $obj1["c_name"];
				$temp["i_enable"]			= $arr_status[$obj1["i_enable"]];
				
				//=================================//
				
				${$root}[]	= $temp;
				
 
				
				
					foreach( $Arr2[$hdr_id] AS $cost_id => $obj2 ) {
						if ($cost_id>0)
						{
							//=================================//
							$temp		= array();
							
							$temp["i_type"]				= 2;
							$temp["no"]					= ++$no2;
							$temp["cost_code"]			= $obj2["cost_code"];
							$temp["cost_name"]			= $obj2["cost_name"];
							$temp["cost_acc_name"]		= $obj2["cost_acc_name"];
							//=================================//
								
							${$root}[]	= $temp;
						}
						//=================================//
					}
				
				
			}
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
