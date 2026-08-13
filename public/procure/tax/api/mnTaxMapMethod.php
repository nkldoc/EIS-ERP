<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
$mode	= $_REQUEST["mode"];
$table 	= "tax_map_method";
$keyName= "tax_map_method_id";

$data = $util->mnUser($_REQUEST);


$fld = array("dc_acc_id", 
                "dc_tax_method_id",
                "dc_section_tax_id", 
                "dc_user_create_id",
                "dc_user_create_cost_id",
                "d_create",
                "dc_user_update_id",
                "dc_user_update_cost_id",
                "d_update");
// 	COPPY	
switch ($mode) {
    case "COPPY" :  
        $arrParam = array(); 
        $sql 		= "INSERT INTO tax_map_method (dc_acc_id
                                    ,dc_tax_method_id
                                    ,dc_section_tax_id
                                    ,dc_user_create_id
                                    ,dc_user_create_cost_id
                                    ,d_create
                                    ,dc_user_update_id
                                    ,dc_user_update_cost_id
                                    ,d_update) 
                            SELECT ".$data['dc_acc_id']."
                                    ,dc_tax_method_id
                                    ,dc_section_tax_id
                                    ,".$data['dc_user_update_id']."
                                    ,".$data['dc_user_update_cost_id']."
                                    ,'".$data['d_update']."'
                                    ,".$data['dc_user_update_id']."
                                    ,".$data['dc_user_update_cost_id']."
                                    ,'".$data['d_update']."' 
                            FROM {$table} where dc_acc_id=?";  
        $arrParam = array($_REQUEST['dc_acc_mapping_id']);
    break;
    case "ADD" : 
        $arrParam 	= array();
        $addField 	= "";
        $addValue 	= ""; 
        $jsonDtl 	= json_decode(@$data["jsonDtl"],true); 
        $sql = "";
        $list_chk = "";
        if(is_array($jsonDtl))
        {
            foreach($jsonDtl as $key => $jObj)
            {  
                if($jObj["i_chk"])
                {
                    $list_chk .= ($list_chk == "")? $jObj["id"]: " ,".$jObj["id"];
                    $data['dc_tax_method_id'] 	= $jObj["id"];
                    $dc_acc_id = $data['dc_acc_id'];

                    // check old data
                    $chk_id = $db->GetDataBySQL("select dc_tax_method_id from tax_map_method where dc_acc_id=? and dc_tax_method_id = ?", array($dc_acc_id, $jObj["id"]));
                    if ($chk_id > 0)
                    {
                            $sql .= "UPDATE {$table} SET i_enable = ? WHERE dc_acc_id=? and dc_tax_method_id = ?;";
                            $arrParam[] 				= STATUS_ENABLE;
                            $arrParam[] 				= $dc_acc_id;
                            $arrParam[] 				= $data['dc_tax_method_id'];
                    }
                    else {
                        $sql .= "INSERT INTO {$table} (dc_acc_id, 
                                    dc_tax_method_id,
                                    dc_section_tax_id, 
                                    dc_user_create_id,
                                    dc_user_create_cost_id,
                                    d_create,
                                    dc_user_update_id,
                                    dc_user_update_cost_id,
                                    d_update,
                                    i_enable) values (?,?,?,?,?,?,?,?,?,?);";

                        $arrParam[] 				= $dc_acc_id;
                        $arrParam[] 				= $data['dc_tax_method_id'];
                        $arrParam[] 				= $data['dc_section_tax_id'];
                        $arrParam[] 				= $data['dc_user_create_id'];
                        $arrParam[] 				= $data['dc_user_create_cost_id'];
                        $arrParam[] 				= $data['d_create'];
                        $arrParam[] 				= $data['dc_user_update_id'];
                        $arrParam[] 				= $data['dc_user_update_cost_id'];
                        $arrParam[] 				= $data['d_update']; 
                        $arrParam[] 				= STATUS_ENABLE;
                    }
                }
            } 
        } 

        $sql .= "UPDATE {$table} SET i_enable = ? WHERE dc_acc_id=? and dc_section_tax_id=? and dc_tax_method_id not in ({$list_chk});";
        $arrParam[] = STATUS_DISABLE;
        $arrParam[] = $dc_acc_id;
        $arrParam[] = $data['dc_section_tax_id'];

    break;
    case "EDIT" :

        $arrParam 	= array();
        $addField 	= "";
        $addValue 	= ""; 
        $jsonDtl 	= json_decode(@$data["jsonDtl"],true); 
        $sql = "";
        $list_chk = "";
        if(is_array($jsonDtl))
        {
            foreach($jsonDtl as $key => $jObj)
            {  
                if($jObj["i_chk"])
                {
                    $list_chk .= ($list_chk == "")? $jObj["id"]: " ,".$jObj["id"];
                    $data['dc_tax_method_id'] 	= $jObj["id"];
                    $dc_acc_id = $data['dc_acc_id'];

                    // check old data
                    $chk_id = $db->GetDataBySQL("select dc_tax_method_id from tax_map_method where dc_acc_id=? and dc_tax_method_id = ?", array($dc_acc_id, $jObj["id"]));
                    if ($chk_id > 0) {
                        $sql .= "UPDATE {$table} SET i_enable = ? WHERE dc_acc_id=? and dc_tax_method_id = ?;";
                        $arrParam[] 				= STATUS_ENABLE;
                        $arrParam[] 				= $dc_acc_id;
                        $arrParam[] 				= $data['dc_tax_method_id'];
                    } else {
                        $sql .= "INSERT INTO {$table} (dc_acc_id, 
                                dc_tax_method_id,
                                dc_section_tax_id, 
                                dc_user_create_id,
                                dc_user_create_cost_id,
                                d_create,
                                dc_user_update_id,
                                dc_user_update_cost_id,
                                d_update,
                                i_enable) values (?,?,?,?,?,?,?,?,?,?);";

                        $arrParam[] 				= $dc_acc_id;
                        $arrParam[] 				= $data['dc_tax_method_id'];
                        $arrParam[] 				= $data['dc_section_tax_id'];
                        $arrParam[] 				= $data['dc_user_create_id'];
                        $arrParam[] 				= $data['dc_user_create_cost_id'];
                        $arrParam[] 				= $data['d_create'];
                        $arrParam[] 				= $data['dc_user_update_id'];
                        $arrParam[] 				= $data['dc_user_update_cost_id'];
                        $arrParam[] 				= $data['d_update']; 
                        $arrParam[] 				= STATUS_ENABLE;
                    }
                }
            } 
        } 

        $sql .= "UPDATE {$table} SET i_enable = ? WHERE dc_acc_id=? and dc_tax_method_id not in ({$list_chk});";
        $arrParam[] 				= STATUS_DISABLE;
        $arrParam[] 				= $dc_acc_id;
    break;
    case "DELETE" :
        $sql 		= "DELETE FROM {$table} WHERE dc_acc_id=? and dc_section_tax_id = ?;"; 
        $arrParam[] = $_REQUEST['dc_acc_id'];  
        $arrParam[] = $_REQUEST['id'];  
    break;
}  
	
$db->BeginTran(); 
$stmt = $db->QueryParam($sql, $arrParam);

if ($stmt)
{
    $db->CommitTran();
    $re = array("reval"=>0,"success"=>"Success","msg"=>"commit");
}
else
{
    $db->RollBackTran();
    $re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
}

echo json_encode($re);
exit;
?>