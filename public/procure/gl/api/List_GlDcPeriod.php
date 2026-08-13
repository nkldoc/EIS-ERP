<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/configGl.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$table		= "gl_dc_period";
$root		= "data";
$data		= array();
$con		= null;

if($_REQUEST["type"] == "gl_dc_period") {
	
	$sqlTempTable = "SELECT TOP 12 c_mm , c_yyyy
						, SUM(sys_1) as sys1 
						, SUM(sys_2) as sys2
						, SUM(sys_3) as sys3
					FROM (SELECT c_mm , c_yyyy
						, CASE WHEN i_system = 1 THEN i_status ELSE 0 END AS sys_1 
						, CASE WHEN i_system = 2 THEN i_status ELSE 0 END AS sys_2
						, CASE WHEN i_system = 3 THEN i_status ELSE 0 END AS sys_3
					FROM {$table}
					WHERE i_last_period = ?) a
					GROUP BY c_mm , c_yyyy
					ORDER BY c_yyyy DESC, c_mm";

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a";
	
	$i = 1;
	
	$arrParam[]	= 1;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	while($row =$db->Fetch($stmt)) {
		$temp = array("no"		=> ($i++),
					"c_mm"		=> $row["c_mm"],
					"c_yyyy"	=> ($row["c_yyyy"]+543),
					"sys1"		=> $row["sys1"],
					"sys2"		=> $row["sys2"],
					"sys3"		=> $row["sys3"]
				);
		${$root}[] = $temp;
	}
	
	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	
	echo json_encode(array("debug"=>true, $root=>${$root}, "totalCount"=>$totalCount));
	exit;
}
?>
