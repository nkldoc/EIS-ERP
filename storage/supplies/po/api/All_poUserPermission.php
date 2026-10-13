<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$util	= new apiUtil();
$date 	= new i_date();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_cost_sys_main") {

	if (@$_REQUEST["all"] == "all") {
		${$root}[] = array(
			"id"                    => "0",
			"dc_cost_main_id"       => "0",
			"c_name"                => "- เลือกทั้งหมด -",
			"i_main"                => "0",
		);
	}
	if (@$_REQUEST["i_read"] == 1) {
		$con = " AND a.dc_cost_id = " . $_SESSION["dc_cost_id"];
	}

	$sql = "
		SET NOCOUNT ON
		DECLARE @TEMP_SP_USER_COST_SYS TABLE (dc_cost_id BIGINT); 
		INSERT INTO @TEMP_SP_USER_COST_SYS EXEC " . DB_CENTER . "SP_USER_COST_SYS "
		. (@$_SESSION["user_id"] ?? "null") . ","
		. (@$_SESSION['i_type_user'] ?? "null") . ","
		. (@$_REQUEST["i_read"] ?? "null") . ","
		. (@$_REQUEST["c_code_sys"] ? "'" . $_REQUEST["c_code_sys"] . "'" : "null") . ";

		select
			dc_cost_id as dc_cost_main_id
			,b.dc_cost_acc_id
			,c_name
			,b.i_main
		from " . DB_CENTER . "dc_cost a 
		inner join (
		select 
			left(c_code,2) + '000000'  as c_code
			,max(b.dc_cost_acc_id) as dc_cost_acc_id
			,case when isnull(max(dc_user_id),0) > 0 then 1 else 0 end as i_main
			-- ,b.dc_cost_acc_id
			-- ,c.dc_user_id
		from @TEMP_SP_USER_COST_SYS a
		inner join " . DB_CENTER . "dc_cost b on a.dc_cost_id = b.dc_cost_id
		left join " . DB_CENTER . "dc_user c on a.dc_cost_id = c.dc_cost_id and dc_user_id = " . (@$_SESSION["user_id"] ?? "null") . "
		where b.i_fund_type = 99 {$con}
		group by left(c_code,2) + '000000'
		) b on a.c_code  = b.c_code
    ";

	$arrParam = array();
	$stmt = $db->QueryParam($sql, $arrParam);
	while ($row = $db->Fetch($stmt)) {
		$temp = array(
			"id"                    => $row["dc_cost_acc_id"],
			"dc_cost_main_id"       => $row["dc_cost_main_id"],
			"c_name"                => $row["c_name"],
			"i_main"                => $row["i_main"],
		);
		${$root}[] = $temp;
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
