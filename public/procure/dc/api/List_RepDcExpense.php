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
	
	global $db, $date, $root, $data, $con, $arr_status;
 
	$totalCount		= 0;
	
	if($_REQUEST["i_enable"] > 0) { $con .= " AND a.i_enable = ".$_REQUEST["i_enable"]; } 
	
	$sqlMain = "SET NOCOUNT ON
				SELECT a.* 
					,(select b.c_code+' '+b.c_name from dc_expense_group b where b.dc_expense_group_id=a.dc_expense_group_id) as c_group_full
					,case when (a.dc_acc_id>0) then (select c.c_code+' '+c.c_name from dc_acc c where c.dc_acc_id=a.dc_acc_id) else 'ยังไม่ระบุผังบัญชี' end as c_acc_full
					,isnull(a.dc_acc_id,0) as the_dc_acc_id
					,case when (a.dc_acc_id_overlap>0) then (select c.c_code+' '+c.c_name from dc_acc c where c.dc_acc_id=a.dc_acc_id_overlap) else 'ยังไม่ระบุผังบัญชี  (เหลื่อมปี)' end as c_acc_full_overlap
					,isnull(a.dc_acc_id_overlap,0) as dc_acc_id_overlap 
				FROM dc_expense a
				WHERE i_delete = ".DELETE_FALSE."
					{$con}
				ORDER BY c_code;";

	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"						=> ++$totalCount,
							"c_code"					=> $row["c_code"], 
							"c_map_code"				=> $row["c_map_code"],
							"c_name"					=> $row["c_name"], 
							"i_enable"					=> $row["i_enable"],
							"c_comment"					=> $row["c_comment"],
							"c_group_full"				=> $row["c_group_full"],
							"c_acc_full"				=> $row["c_acc_full"],
							"the_dc_acc_id"				=> $row["the_dc_acc_id"],
							"c_acc_full_overlap"		=> $row["c_acc_full_overlap"],
							"the_dc_acc_id_overlap"		=> $row["dc_acc_id_overlap"]
							
						  );
			
			${$root}[] = $temp;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
