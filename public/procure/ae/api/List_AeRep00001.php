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
	
	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy;
	
	$arrType	= array("2"=>"แถวเดียวกับชื่อบัญชี", "1"=>"แถวล่าง", "3"=>"ไม่ระบุ");
	$arrFixed	= array("1"=>"ไม่เป็นต้นทุน", "2"=>"ต้นทุนคงที่", "3"=>"ต้นทุนผันแปร");

	$totalCount		= 0;

	// ========================================================================================== //
	if( $_REQUEST["i_group"] > 0 ) { $con .= " AND a.i_group=".$_REQUEST["i_group"]; }
	
	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						a.dc_acc_id,
						a.c_code,
						a.c_code_tree,
						a.c_name,
						a.i_show_name,
						a.i_show_level,
						ISNULL(a.i_show_exp_type,0) AS i_show_exp_type,
						a.i_is_fixed,
						a.i_level,
						a.i_group
					FROM dc_acc a
					WHERE a.i_level IN (3,4,5,6) AND a.i_enable=1
					{$con}
					ORDER BY a.c_code_tree;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
			
			$temp["dc_acc_id"]				= $row["dc_acc_id"];
			$temp["i_level"]				= $row["i_level"];
			$temp["c_code"]					= $row["c_code"];
			$temp["c_name"]					= $row["c_name"];
			$temp["i_show_name"]			= $row["i_show_name"];
			$temp["i_show_level"]			= $row["i_show_level"];
			$temp["i_show_exp_type"]		= ( $row["i_level"] < 6 )? $arrType[$row["i_show_exp_type"]] : "-";
			$temp["i_is_fixed"]				= ( $row["i_group"] == 5 && $row["i_is_fixed"] > 0 )? $arrFixed[$row["i_is_fixed"]] : "-";
			
			${$root}[]	= $temp;
			$totalCount++;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>