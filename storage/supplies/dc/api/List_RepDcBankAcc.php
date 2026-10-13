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
	
	if($_REQUEST["dc_bank_id"] > 0) { $con .= " AND a.dc_bank_id = ".$_REQUEST["dc_bank_id"]; }
	if($_REQUEST["dc_bank_deposit_type_id"] > 0) { $con .= " AND a.dc_bank_deposit_type_id = ".$_REQUEST["dc_bank_deposit_type_id"]; }
	if($_REQUEST["dc_area_id"] > 0) { $con .= " AND a.dc_area_id = ".$_REQUEST["dc_area_id"]; }
	if($_REQUEST["i_enable"] > 0) { $con .= " AND a.i_enable = ".$_REQUEST["i_enable"]; }
	
	$sqlMain = "SELECT
					b.c_name AS bank_name,
					c.c_name AS bank_branch_name,
					d.c_name AS bank_deposit_type_name,
					a.c_code,
					a.c_name,
					e.c_name AS area_name,
					f.c_name AS acc_name,
					a.c_comment,
					a.i_enable
					,a.dc_bank_acc_company_id
				FROM dc_bank_acc_company a
					LEFT JOIN dc_bank b ON a.dc_bank_id = b.dc_bank_id
					LEFT JOIN dc_bank_branch c ON a.dc_bank_branch_id = c.dc_bank_branch_id
					LEFT JOIN dc_bank_deposit_type d ON a.dc_bank_deposit_type_id = d.dc_bank_deposit_type_id
					LEFT JOIN dc_area e ON a.dc_area_id = e.dc_area_id
					LEFT JOIN dc_acc f ON a.dc_acc_id = f.dc_acc_id
				WHERE a.i_delete = ".DELETE_FALSE."
					AND b.i_delete = ".DELETE_FALSE."
					AND c.i_delete = ".DELETE_FALSE."
					AND d.i_delete = ".DELETE_FALSE."
					AND e.i_delete = ".DELETE_FALSE."
					AND f.i_delete = ".DELETE_FALSE."
					{$con}
				ORDER BY a.c_code;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			
			$temp		= array();
	
			$temp["no"]							= ++$totalCount;
			$temp["bank_name"]					= $row["bank_name"];
			$temp["bank_branch_name"]			= $row["bank_branch_name"];
			$temp["bank_deposit_type_name"]		= $row["bank_deposit_type_name"];
			$temp["c_code"]						= $row["c_code"];
			$temp["c_name"]						= $row["c_name"];
			$temp["area_name"]					= $row["area_name"];
			$temp["acc_name"]					= $row["acc_name"];
			$temp["c_comment"]					= $row["c_comment"];
			$temp["i_enable"]					= $row["i_enable"];
			
			
			$temp["dc_bank_acc_company_id"]					= $row["dc_bank_acc_company_id"];
			
			${$root}[]	= $temp;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
