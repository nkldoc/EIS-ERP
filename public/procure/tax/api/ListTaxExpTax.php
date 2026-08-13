<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db	= new DatabaseServer();
$date	= new i_date();

$root	= "data";
$data	= array();

$con	= null;
$mode	= @$_REQUEST["mode"];
$value	= @$_REQUEST["value"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start	= 0; }
if (!get($limit))	{ $limit	= 20; }else{ $limit=($limit+$start); }

if($mode == "SEARCH") {
    if($value != ""){
            $con	.= " AND a.c_code LIKE '%$value%' ";
    }
}

$sqlTempTable = "SELECT ROW_NUMBER() OVER (ORDER BY c_code ASC) AS numrow
                    , tax_exp_tax_id
                    , a.c_code
                    , a.c_comment
                    , convert(VARCHAR(10), a.d_start, 120) AS d_start
                    , convert(VARCHAR(10), a.d_finish, 120) AS d_finish
                    , a.f_exp_max
                    , a.i_percent
                    , a.i_enable
                    , a.i_delete
                    , (SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
                    , (SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
                    , convert(VARCHAR, a.d_create, 120) AS d_create
                    , (SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
                    , (SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
                    , convert(VARCHAR, a.d_update, 120) AS d_update
                FROM tax_exp_tax a
                    WHERE a.i_delete = 2 {$con}";

$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ?";

$arrParam[]	= $start;
$arrParam[]	= $limit;

$stmt = $db->QueryParam($sqlMain, $arrParam);
while($row =$db->Fetch($stmt))				
{
        $temp = array(	"no"			=> $row["numrow"],
                        "id"			=> $row["tax_exp_tax_id"],
                        "c_code"		=> $row["c_code"],
                        "c_comment"		=> $row["c_comment"],
                        "d_start"		=> $date->extDateBuddha($row["d_start"]),
                        "d_finish"		=> $date->extDateBuddha($row["d_finish"]),
                        "f_exp_max"		=> $row["f_exp_max"],
                        "i_percent"		=> $row["i_percent"],
                        "i_enable"		=> $row["i_enable"],
                        "i_delete"		=> $row["i_delete"],
                        "dc_user_create_id"	=> $row["dc_user_create"],
                        "dc_user_create_cost_id"=> $row["dc_user_create_cost"],
                        "d_create"		=> $date->extDateBuddha($row["d_create"]),
                        "dc_user_update_id"	=> $row["dc_user_update"],
                        "dc_user_update_cost_id"=> $row["dc_user_update_cost"],
                        "d_update"		=> $date->extDateBuddha($row["d_update"])
                    );
        ${$root}[] = $temp;
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>