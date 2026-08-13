<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../gl/conf/configGl.php");
 
$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if($_REQUEST["type"] == "LIST") {

	$sqlMain	="	SELECT
						a.dc_acc_id, a.c_code, a.c_name
						,CASE
							WHEN b.dc_acc_id IS NULL THEN 0
							ELSE 1
						END AS i_chk
					FROM vw_dc_acc a
						LEFT JOIN imp_fix_acc b ON a.dc_acc_id = b.dc_acc_id AND report_number = 1
					WHERE a.i_last = ? AND a.i_enable = ?
					ORDER BY c_code";
	$arrParam	= array(I_LAST, STATUS_ENABLE); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=1;
	if($stmt) {
		$strCol1 = "";
		$i_row = 1;
		while($row =$db->Fetch($stmt)) {
			$cheked = ($row["i_chk"]==1)?"checked='checked'":"";
			if ($i_row%2 == 0){
				$temp = array(
					"checkbox1"	=>$strCol1, 
					"checkbox2"	=>""
						."<input type='checkbox' {$cheked} id='cbID".$row["dc_acc_id"]
						."' name='dc_acc_id[{$row["dc_acc_id"]}][]' value='"
						.$row["dc_acc_id"]."'><label for='cbID".$row["dc_acc_id"]
						."'> {$row["c_code"]} - {$row["c_name"]}</label>"
					); 
				${$root}[] = $temp;
				$strCol1 = "";
			}else{
				$strCol1 = "<input type='checkbox' {$cheked} id='cbID".$row["dc_acc_id"]
							."' name='dc_acc_id[{$row["dc_acc_id"]}][]' value='"
							.$row["dc_acc_id"]."'><label for='cbID".$row["dc_acc_id"]
							."'> {$row["c_code"]} - {$row["c_name"]}</label>";
			}
			$i_row++;
		}
		
		if ($strCol1 != ""){
			$temp = array( "checkbox1" => $strCol1, "checkbox2" => "" ); 
			${$root}[] = $temp;
		}
	} 
    
echo json_encode(array("debug"=>true,$root=>${$root}));
exit;    
}
?>