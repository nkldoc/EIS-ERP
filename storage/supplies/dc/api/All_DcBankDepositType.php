<?php
include("../../lib/database/DatabaseServer.php");
include("../conf/configDc.php");

$db = new DatabaseServer();

$root	= "data";

if($_REQUEST["type"] == "main") {
	foreach ($CONF_I_BANK_DEPOSIT_TYPE_MAIN as $key => $val) {
		$temp = array(
				"id"		=> "{$key}",
				"c_name"	=> "{$val}"
		);
		${$root}[] = $temp;
	}
} else if($_REQUEST["type"] == "main_all") {
	${$root}[] = array(
			"id"		=> "0",
			"c_name"	=> "ทั้งหมด"
	);
	foreach ($CONF_I_BANK_DEPOSIT_TYPE_MAIN as $key => $val) {
		$temp = array(
				"id"		=> "{$key}",
				"c_name"	=> "{$val}"
		);
		${$root}[] = $temp;
	}
} else if($_REQUEST["type"] == "deposit_type") {
	foreach ($CONF_I_BANK_DEPOSIT_TYPE_ITYPE as $key => $val) {
		$temp = array(
				"id"		=> "{$key}",
				"c_name"	=> "{$val}"
		);
		${$root}[] = $temp;
	}
} else if($_REQUEST["type"] == "deposit_type_all") {
	${$root}[] = array(
			"id"		=> "0",
			"c_name"	=> "ทั้งหมด"
	);
	foreach ($CONF_I_BANK_DEPOSIT_TYPE_ITYPE as $key => $val) {
		$temp = array(
				"id"		=> "{$key}",
				"c_name"	=> "{$val}"
		);
		${$root}[] = $temp;
	}
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>