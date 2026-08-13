<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
##########################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
###################
$table	= "vw_dc_tax_def";
$root	= "data";
$data	= array();
###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"];
###################
if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
if (!$util->get($dir))	{   $dir 	= "ASC"; }
if (!$util->get($sort)) {  	$sort 	= "c_name"; }
###################

$sqlTempTable = "SELECT
                    ROW_NUMBER() OVER (ORDER BY a.c_code ASC) AS row,
                    a.dc_debtor_id,
                    a.dc_debtor_type_id,
                    c.c_name AS dc_debtor_type_name,
                    a.dc_acc_id,
                    a.dc_tax_customer_id,
                    b.c_name AS dc_tax_customer_name,
                    a.dc_title_id,
                    a.c_old_code,
                    a.c_code,
                    a.c_name,
                    a.c_surname,
                    a.c_address,
                    a.c_telephone,
                    a.c_mobile,
                    a.c_fax,
                    a.c_website,
                    a.c_email,
                    a.c_tax_value,
                    a.c_ref_value,
                    a.c_comment,
                    a.i_enable,
                    a.due_bill,
                    a.c_name_inv,
                    a.c_address_inv,
                    a.c_address_inv2,
                    a.c_title,
                    a.i_branch,
                    case when a.i_branch = 2 then a.c_branch else '' end as c_branch,
                    (SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create,
                    (SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost,
                    convert(VARCHAR, a.d_create, 120) AS d_create,
                    (SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update,
                    (SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost,
                    convert(VARCHAR, a.d_update, 120) AS d_update
                FROM vw_dc_debtor a 
                    LEFT JOIN vw_dc_tax_customer b ON a.dc_tax_customer_id = b.dc_tax_customer_id
                    LEFT JOIN vw_dc_debtor_type c ON a.dc_debtor_type_id = c.dc_debtor_type_id
                WHERE 1 = ?".$util->viewAcc($i_read, "a");

if($mode=="SEARCH"){
    if (isset($filter)&&$filter!="")
    {
        $sqlTempTable .= " and a.".$filter." like ?";
    }
    $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";

    // parameter ของ ชุดแสดงรายการ
    $arrParam = array(1, "%{$value}%", $start, $limit);
    // parameter ของ ชุดนับจำนวนรายการ
    $arrCountParam =  array(1, "%{$value}%");
}
else
{
    $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
    // parameter ของ ชุดแสดงรายการ
    $arrParam = array(1, $start, $limit);
    // parameter ของ ชุดนับจำนวนรายการ
    $arrCountParam =  array(1);
}

$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;
while($row =$db->Fetch($stmt))				
{
	$temp = array("no" => ($i++), 
                        "id" => $row["dc_debtor_id"],
                        "dc_debtor_type_id" => $row["dc_debtor_type_id"],
                        "dc_debtor_type_name" => $row["dc_debtor_type_name"],
                        "dc_acc_id" => $row["dc_acc_id"],
                        "dc_tax_customer_id" => $row["dc_tax_customer_id"],
                        "dc_tax_customer_name" => $row["dc_tax_customer_name"],
                        "dc_title_id" => $row["dc_title_id"],
                        "c_old_code" => $row["c_old_code"],
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"],
                        "c_surname" => $row["c_surname"],
                        "c_address" => $row["c_address"],
                        "c_telephone" => $row["c_telephone"],
                        "c_mobile" => $row["c_mobile"],
                        "c_fax" => $row["c_fax"],
                        "c_website" => $row["c_website"],
                        "c_email" => $row["c_email"],
                        "c_tax_value" => $row["c_tax_value"],
                        "c_ref_value" => $row["c_ref_value"],
                        "c_comment" => $row["c_comment"],
                        "i_enable" => $row["i_enable"],
                        "due_bill" => $row["due_bill"],
                        "c_name_inv" => $row["c_name_inv"],
                        "c_address_inv" => $row["c_address_inv"],
                        "c_address_inv2" => $row["c_address_inv2"],
                        "c_title" => $row["c_title"],
                        "i_branch" => $row["i_branch"],
                        "c_branch" => $row["c_branch"],
                        "dc_user_create_id" =>$row["dc_user_create"],
                        "dc_user_create_cost_id" =>$row["dc_user_create_cost"],
                        "d_create" =>$date->extDateBuddha($row["d_create"]),
                        "dc_user_update_id" =>$row["dc_user_update"],
                        "dc_user_update_cost_id" =>$row["dc_user_update_cost"],
                        "d_update" =>$date->extDateBuddha($row["d_update"])
                    );
	${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>