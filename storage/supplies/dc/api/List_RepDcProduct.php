<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php"); 
include("../../lib/date/i_date.class.php");
include("../conf/configDc.php");

$db 		= new DatabaseServer();
$date		= new i_date();

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam() {
	
	global $db, $date, $root, $data, $con, $arr_status,$CONF_I_TYPE_DC_BG;
 
	$totalCount		= 0;
	
	if($_REQUEST["i_enable"] > 0) { $con .= " AND a.i_enable = ".$_REQUEST["i_enable"]; } 
	
	$sqlMain = "SET NOCOUNT ON
				SELECT a.* 
					,(select b.c_code+' '+b.c_name from dc_product_group b where b.dc_product_group_id=a.dc_product_group_id) as c_group_full
					,case when (a.dc_acc_id>0) then (select c.c_code+' '+c.c_name from dc_acc c where c.dc_acc_id=a.dc_acc_id) else 'ยังไม่ระบุผังบัญชี' end as c_acc_full
					,isnull(a.dc_acc_id,0) as the_dc_acc_id
				FROM dc_product a
				WHERE i_delete = ".DELETE_FALSE."
					{$con}
				ORDER BY c_code;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"				=> ++$totalCount,
							"c_group_full"		=> $row["c_group_full"], 
							"c_code"			=> $row["c_code"], 
							"c_map_code"		=> $row["c_map_code"],
							"c_name"			=> $row["c_name"], 
							"c_acc_full"		=> $row["c_acc_full"], 
							"i_enable"			=> $row["i_enable"],
							"c_comment"			=> $row["c_comment"],
							"the_dc_acc_id"		=> $row["the_dc_acc_id"]
							);
			
			${$root}[] = $temp;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
