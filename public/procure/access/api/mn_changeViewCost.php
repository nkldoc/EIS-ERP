<?php
include("../../conf/config.php");
if (@$_SESSION["user_id"] != 1) {
	echo "No access rights.";
	exit;
}

$_REQUEST["dc_cost_id"] =  $_REQUEST["dc_cost_id"] == 0 ? 3 : $_REQUEST["dc_cost_id"];

if ($_REQUEST["dc_cost_id"] == 3) {
	$_SESSION["i_type_user"]              = 2;
	$_SESSION["dc_cost_id"]               = 3;
	$_SESSION["cost_code"]                = "9901000";
	$_SESSION["cost_name"]                = "บริษัทบำรุงรักษาระบบ";
} else {
	$dc_cost = explode(" : ", $_REQUEST["dc_cost_name"]);
	$_SESSION["i_type_user"]              = 1;
	$_SESSION["dc_cost_id"]               = $_REQUEST["dc_cost_id"];
	$_SESSION["cost_code"]                = $dc_cost[0];
	$_SESSION["cost_name"]                = $dc_cost[1];
}

$re = array(
	"success"					=> true,
	"msg"						=> ""
);
echo json_encode($re);
exit;
