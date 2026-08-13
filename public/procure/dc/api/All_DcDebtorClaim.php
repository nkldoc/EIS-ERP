<?php
include("../../lib/database/DatabaseServer.php");
include("../conf/configDc.php");

$db = new DatabaseServer();

$root	= "data";

if ($_REQUEST["type"] == "arr_fund") {
	foreach ($CONF_I_FUND_TYPE as $key => $val) {
		$temp = array(
			"id"		=> "{$key}",
			"c_name"	=> "{$val}"
		);
		${$root}[] = $temp;
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
