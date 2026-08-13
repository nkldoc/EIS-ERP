<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../gl/conf/configGl.php");
 
$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

//GL_ACC_GROUP4_REVENUE //4000000000	รายได้

if($_REQUEST["type"] == "LIST") {

	$sqlMain	="select a.dc_acc_id, a.c_code, a.c_name
					, case when b.dc_acc_id is null then 0 else 1 end as i_chk
				from vw_dc_acc a
					left join conf_acc_rep b on a.dc_acc_id = b.dc_acc_id and report_number = 1
				where a.i_group = ? and a.i_last = ? and a.i_enable = ?
				order by c_code";
	$arrParam	= array(GL_ACC_GROUP4_REVENUE, I_LAST, STATUS_ENABLE); 
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
			$temp = array(
				"checkbox1"	=>$strCol1, 
				"checkbox2"	=>""
				); 
			${$root}[] = $temp;
		}
	} 
    
echo json_encode(array("debug"=>true,$root=>${$root}));
exit;    
}
?>