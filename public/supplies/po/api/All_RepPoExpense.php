<?php
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$root	= "data";

if($_REQUEST['type'] == 'po_expense_lv1') {
	$sqlMain	= "	SELECT po_expense_id,left(c_code,2) as c_group,c_code+' '+c_name  as c_full
					FROM po_expense
					WHERE i_level = 1  and i_enable=1
					ORDER BY c_code ASC";
	$arrParam[]	= 1;
	$arrParam[]	= 2;
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt){
		${$root}[] = array(
				"id"		=> '0',
				"c_name"	=> 'เลือกทั้งหมด'
		);
		while($row =$db->Fetch($stmt)){
			$temp = array(
					"id"		=> $row["po_expense_id"],
					"c_name"	=> $row["c_full"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>
