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

if($_REQUEST["type"] == "dc_acc") {
	
	$mode				= @$_REQUEST["mode"];
	$filter				= @$_REQUEST["filter"];
	$value				= @$_REQUEST["value"];
	$i_read				= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if ( !$util->get($start) ) { $start 	= 0; }
	if ( !$util->get($limit) ) { $limit 	= 20; }else{ $limit=($limit+$start); }
	
	switch( $i_read ) {
		case 1:		$con = " AND dc_user_create_id= ".$_SESSION["user_id"]; break;
		case 2:		$con = " AND dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
		default:	$con = "";
	}

	if($mode == "SEARCH") {
		if($value != "")	{ $con	.= " AND ".$filter." LIKE '%$value%' "; }
	}

	$sqlTempTable = "SELECT
						ROW_NUMBER() OVER (ORDER BY c_code_tree) AS numrow,
						dc_acc_id,
						c_code,
						c_code_tree,
						c_name,
						i_group
					FROM dc_acc
					WHERE i_enable=1 AND i_level=1
					{$con}";
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	while($row =$db->Fetch($stmt)) {
		$temp = array(	"no"						=> $row["numrow"],
						"id"						=> $row["dc_acc_id"],
						"c_code"					=> $row["c_code"],
						"c_code_tree"				=> $row["c_code_tree"],
						"c_name"					=> $row["c_name"],
						"i_group"					=> $row["i_group"]
		);
		${$root}[] = $temp;
	}

	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
	
	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
	exit;

} else if($_REQUEST["type"] == "acc_tree") {
	
	$sqlTempTable = "SELECT
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
						AND a.i_group=?";

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a ORDER BY a.c_code_tree";

	$arrParam[]	= $_REQUEST["i_group"];

	$i	= 0; // numrow
	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	if( $stmt ) {

		while( $row=$db->Fetch($stmt) ) {
			
			$temp	= array("no"				=> ++$i,
							"id"				=> $row["dc_acc_id"],
							"c_name"			=> $row["c_name"],
							"c_code"			=> $row["c_code"],
							"c_code_tree"		=> $row["c_code_tree"],
							"i_show_name"		=> $row["i_show_name"],
							"i_show_level"		=> $row["i_show_level"],
							"i_show_exp_type"	=> $row["i_show_exp_type"],
							"i_is_fixed"		=> $row["i_is_fixed"],
							"i_level"			=> $row["i_level"],
							"i_group"			=> $row["i_group"]
			);
			${$root}[] = $temp;
			
		}
	}
	$totalCount	= $i;
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
	exit;
}
?>
