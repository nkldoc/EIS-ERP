<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date	= new i_date();

$root		= "data";
$data		= array();

$con	= null;
$mode	= @$_REQUEST["mode"];
$value	= @$_REQUEST["value"];
$type	= @$_REQUEST["type"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start	= 0; }
if (!get($limit))	{ $limit	= 20; }else{ $limit=($limit+$start); }

if($mode == "SEARCH") {
	if($value != ""){
		$con	.= " AND a.c_name LIKE '%$value%' ";
	}
}

if($type == "tax") {
	$sqlTempTable = " SELECT
                            ROW_NUMBER() OVER (ORDER BY cast(c_code as int) ASC) AS numrow,
                            a.dc_section_tax_id,
                            a.c_code,
                            a.i_rank_bank,
                            a.c_name,
                            a.i_type_tax,
                            a.c_comment,
                            a.i_enable,
                            (SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create,
                            (SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost,
                            convert(VARCHAR, a.d_create, 120) AS d_create,
                            (SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update,
                            (SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost,
                            convert(VARCHAR, a.d_update, 120) AS d_update
                        FROM VW_DC_SECTION_TAX a
                        WHERE 1 = 1 $con";
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ?";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	while($row =$db->Fetch($stmt))				
	{
		$temp = array(	"no"                        => $row["numrow"],
                                "id"                        => $row["dc_section_tax_id"],
                                "c_code"                    => $row["c_code"],
                                "i_rank_bank"               => $row["i_rank_bank"],
                                "c_name"                    => $row["c_name"],
                                "i_type_tax"                => $row["i_type_tax"],
                                "c_comment"                 => $row["c_comment"],
                                "i_enable"                  => $row["i_enable"],
                                "dc_user_create_id"         => $row["dc_user_create"],
                                "dc_user_create_cost_id"    => $row["dc_user_create_cost"],
                                "d_create"                  => $date->extDateBuddha($row["d_create"]),
                                "dc_user_update_id"         => $row["dc_user_update"],
                                "dc_user_update_cost_id"    => $row["dc_user_update_cost"],
                                "d_update"                  => $date->extDateBuddha($row["d_update"])
                                );
		${$root}[] = $temp;
	}
} else if($type == "method") {
    $sqlTempTable = "SELECT
                        ROW_NUMBER() OVER (ORDER BY c_name ASC) AS numrow,
                        a.dc_tax_method_id,
                        a.dc_section_tax_id,
                        a.c_code,
                        a.c_name
                    FROM DC_TAX_METHOD a
                    WHERE a.dc_section_tax_id = ?";

    $sqlMain = "SELECT * FROM ({$sqlTempTable}) a";

    $arrParam[]	= $_REQUEST["dc_section_tax_id"];

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while($row =$db->Fetch($stmt))
    {
        $temp = array(	"no"                => $row["numrow"],
                        "id"                => $row["dc_tax_method_id"],
                        "dc_section_tax_id" => $row["dc_section_tax_id"],
                        "c_code"            => $row["c_code"],
                        "c_name"            => $row["c_name"] );

        ${$root}[] = $temp;
    }
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>