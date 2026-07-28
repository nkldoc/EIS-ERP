<?php
include("../../conf/config.php");
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
	
	if($_REQUEST["i_enable"] > 0) { $con .= " AND b.i_enable = ".$_REQUEST["i_enable"]; }
	if($_REQUEST["dc_bank_id"] > 0) { $con .= " AND b.dc_bank_id = ".$_REQUEST["dc_bank_id"]; }
	
	$sqlMain = "SELECT
					a.dc_bank_id,
					a.c_name AS bank_name,
					b.dc_bank_branch_id,
					b.c_code,
					b.branch_code,
					b.c_name,
					b.c_telephone,
					b.c_fax,
					b.c_address,
					b.c_comment,
					b.i_enable
				FROM dc_bank a
					LEFT JOIN dc_bank_branch b ON a.dc_bank_id=b.dc_bank_id
				WHERE a.i_delete = ".DELETE_FALSE." AND b.i_delete = ".DELETE_FALSE."
					{$con}
				ORDER BY a.c_code, b.c_code;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			
			$GroupBank[$row["dc_bank_id"]]["bank_name"]	= $row["bank_name"];

			$DtlArr[$row["dc_bank_id"]][$row["dc_bank_branch_id"]]["c_code"]			= $row["c_code"];
			$DtlArr[$row["dc_bank_id"]][$row["dc_bank_branch_id"]]["branch_code"]		= $row["branch_code"];
			$DtlArr[$row["dc_bank_id"]][$row["dc_bank_branch_id"]]["c_name"]			= $row["c_name"];
			$DtlArr[$row["dc_bank_id"]][$row["dc_bank_branch_id"]]["c_telephone"]		= $row["c_telephone"];
			$DtlArr[$row["dc_bank_id"]][$row["dc_bank_branch_id"]]["c_fax"]				= $row["c_fax"];
			$DtlArr[$row["dc_bank_id"]][$row["dc_bank_branch_id"]]["c_address"]			= $row["c_address"];
			$DtlArr[$row["dc_bank_id"]][$row["dc_bank_branch_id"]]["c_comment"]			= $row["c_comment"];
			$DtlArr[$row["dc_bank_id"]][$row["dc_bank_branch_id"]]["i_enable"]			= $row["i_enable"];
			
			$totalCount++;
		}
		
		if(!is_null(@$GroupBank)) {
			foreach( $GroupBank AS $dc_bank_id => $objBank ) {
					
				//=================================//
				$temp		= array();
					
				$no			= 0;
					
				$temp["i_type"]				= 1;
				$temp["c_name"]				= "ธนาคาร : ".$objBank["bank_name"];
	
				${$root}[]	= $temp;
				//=================================//
				if(!is_null(@$DtlArr[$dc_bank_id])) {
					
					foreach( $DtlArr[$dc_bank_id] AS $dc_bank_branch_id => $objDtl ) {
						
						//=================================//
						$temp		= array();
		
						$temp["i_type"]				= 2;
						$temp["no"]					= ++$no;
						$temp["c_code"]				= $objDtl["c_code"];
						$temp["branch_code"]		= $objDtl["branch_code"];
						$temp["c_name"]				= $objDtl["c_name"];
						$temp["c_telephone"]		= $objDtl["c_telephone"];
						$temp["c_fax"]				= $objDtl["c_fax"];
						$temp["c_address"]			= $objDtl["c_address"];
						$temp["c_comment"]			= $objDtl["c_comment"];
						$temp["i_enable"]			= $objDtl["i_enable"];
							
						${$root}[]	= $temp;
						//=================================//
						
					}
				}
			}
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
