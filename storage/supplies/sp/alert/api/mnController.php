<?php

 include("../../../conf/config.php");
 include("../../../lib/database/DatabaseServer.php");
 include("../../../lib/database/apiUtil.php");
 include("../../../lib/date/i_date.class.php");



 $db = new DatabaseServer();
 $date = new i_date();
 $util = new apiUtil();



 $mode = $_REQUEST["mode"] ?? NULL;

 $table = "dbo.sp_status_hdr";
 $keyName = $table . "_id";

 if ($mode != "EDITLOOP") {
     $data = $util->mnUser($_REQUEST);
     $data["i_delete"] = DELETE_FALSE;
 }
 $c_code_mu = "STT";
 $fld = array("c_code",
     "i_alarm",
     "i_day",
     "i_seq",
     "i_config",
     "c_name",
     "js",
     "code_tomenu",
     "i_enabled",
     "i_delete",
     "dc_user_create_id",
     "dc_user_create_cost_id",
     "d_create",
     "dc_user_update_id",
     "dc_user_update_cost_id",
     "d_update");

 $stmt2 = false;
 $stmt3 = false;
 $db->BeginTran();

 switch ($mode) {
     case "ADD" :
         $arrParam = array();
         $addField = "";
         $addValue = "";

         foreach ($fld as $value) {
             if (!empty($data[$value])) {
                 $addField .= ", {$value}";
                 $addValue .= ", ?";
                 $arrParam[] = $data[$value];
             }
         }

         $sql = "INSERT INTO {$table} (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ")";
         $sql .= "SELECT @@IDENTITY as ret_id";
         $stmt = $db->QueryParam($sql, $arrParam);
         if ($stmt) {
             $next_result = $db->NextResult($stmt);
             if ($next_result) {
                 $dd_hdr = $db->Fetch($stmt);
                 $ret_id = $dd_hdr["ret_id"];
             }

             $code_dc = (string) $c_code_mu;
             $arrParam2 = array($code_dc, $data['dc_user_create_id'], $data['dc_user_create_cost_id'], $ret_id);
             $sql2 = "EXEC SP_GEN_CODE_DC ?,?,?,?;";
             $stmt2 = $db->QueryParam($sql2, $arrParam2);

             $arr_gen_code = $db->Fetch($stmt2);
             $c_code = $arr_gen_code["c_code_gen"];
             $ref_id = $arr_gen_code["reference_id"];

             $stmt3 = false;
             if ($ret_id == $ref_id) {
                 $sql3 = "UPDATE {$table}
				SET c_code=?
				WHERE {$keyName} = ?";
                 $arrParam3 = array($c_code, $ret_id);
                 $stmt3 = $db->QueryParam($sql3, $arrParam3);
             }
         }

         break;
     case "EDITLOOP" :
     
         foreach ($db->json_clean_decode($_REQUEST["gridModifine"]) as $re) {
             $data["id"] = $re->id;
             $data["type_id"] = $re->type_id;
             $data["c_code"] = $re->c_code;
             $data["c_name"] = $re->c_name;
             $data["js"] = $re->js;
             $data["code_tomenu"] = $re->code_tomenu;
             $data["i_alarm"] = $re->i_alarm; //i_alarm
             $data["i_entrance"] = $re->i_entrance; //i_alarm
             $data["i_day"] = $re->i_day; //i_alarm
             $data["i_seq"] = $re->i_seq;
             $data["i_config"] = $re->i_config;
             $data["dc_user_update_id"] = $_SESSION["user_id"];
             $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
             $data["d_update"] = date("Y-m-d H:i:s");

             $arrParam = array();
             $arrParam[] = $data["type_id"];
             $arrParam[] = $data["c_code"];
             $arrParam[] = $data["c_name"];
             $arrParam[] = $data["code_tomenu"];
             $arrParam[] = $data["js"];
             $arrParam[] = $data["i_alarm"];
             $arrParam[] = $data["i_entrance"];
             $arrParam[] = $data["i_day"];
             $arrParam[] = $data["i_seq"];
             $arrParam[] = $data["i_config"];
             $arrParam[] = $data["dc_user_update_id"];
             $arrParam[] = $data["dc_user_update_cost_id"];
             $arrParam[] = $data["d_update"];
             $arrParam[] = $data["id"];

             $sql = "UPDATE dbo.sp_status_hdr SET "
                     . " sp_type_status_id=?"
                     . " ,c_code=?"
                     . " ,c_name=?"
                     . " ,code_tomenu=?"
                     . " ,js=?"
                     . " ,i_alarm=?"
                     . " ,i_entrance=?"
                     . " ,i_day=?"
                     . " ,i_seq=?"
                     . " ,i_config=?"
                     . " ,dc_user_update_id=?"
                     . " ,dc_user_update_cost_id=?"
                     . " ,d_update=?"
                     . "  WHERE sp_status_hdr_id = ?";
             $stmt = $db->QueryParam($sql, $arrParam);
         } //lOOP

         break;
     case "EDIT" :

         $stmt2 = true;
         $stmt3 = true;
         $arrParam = array();
         $upField = "";

         foreach ($fld as $value) {
             if (!empty($data[$value])) {
                 $upField .= ", {$value} = ?";
                 $arrParam[] = $data[$value];
             }
         }
         $sql = "UPDATE {$table} SET " . substr($upField, 1) . " WHERE {$keyName} = ?";
         $arrParam[] = $data["id"];

         $stmt = $db->QueryParam($sql, $arrParam);

         break;
     case "REMOVE" :
         $stmt2 = true;
         $stmt3 = true;
         $sql = "UPDATE {$table} SET i_delete = ? WHERE {$keyName} = ?";
         $arrParam = array(DELETE_TRUE, $data["id"]);
         $stmt = $db->QueryParam($sql, $arrParam);
         break;
     case "DELETE" :
         $stmt2 = true;
         $stmt3 = true;
         $sql = "DELETE FROM dbo.sp_status_hdr WHERE sp_status_hdr_id = ?";
         $arrParam = array($data["id"]);
         $stmt = $db->QueryParam($sql, $arrParam);
         break;
     case "list":
//list
############################################################################################################
         $mode = @$_REQUEST["mode"];
         $filter = @$_REQUEST["filter"];
         $value = @$_REQUEST["value"];
         $i_read = @$_REQUEST["i_read"];
###################
         $root = "data";
         $data = array();
###################
         $limit = @$_REQUEST["limit"];
         $dir = @$_REQUEST["dir"];
         $sort = @$_REQUEST["sort"];
         $start = @$_REQUEST["start"];

         function get($a) {
             return $a ?? 0;
         }

         if (!get($start)) {
             $start = 0;
         }
         if (!get($limit)) {
             $limit = 20;
         } else {
             $limit = ($limit + $start);
         }
         if (!get($dir)) {
             $dir = "ASC";
         }
         if (!get($sort)) {
             $sort = "a.i_seq";
         }

#################################
         $arrParam = array();
         $arrCountParam = array();
         $con = null;
         $conDtl = null;
         $i_type = $_REQUEST['i_type'] ?? null;
         if ($_REQUEST["type"] == "list") {
     
             $arrParam = array();
             $arrCountParam = array();


             $sqlTempTable = "select a.sp_status_hdr_id
                        , a.sp_type_status_id
                        , a.c_name
                         ,a.c_code
                        , a.i_day 
                        , a.i_entrance
                        , a.i_alarm
                        , a.i_seq
                        , a.i_config
                        , a.i_enabled
                        , a.dc_user_create_id , a.dc_user_create_cost_id ,a.d_create
                        , a.dc_user_update_id , a.dc_user_update_cost_id ,a.d_update
                        , row_number() over (order by {$sort} {$dir}) as row
                        from dbo.[sp_status_hdr] a
                        where a.i_enabled = ? and sp_type_status_id=?";

             //echo  $sqlTempTable; exit;
             $arrParam[] = STATUS_ENABLE;
             $arrParam[] = $i_type;

             $arrCountParam[] = STATUS_ENABLE;
             $arrCountParam[] = $i_type;

             $sqlMain = "select a.*
        , (select top 1 js from dbo.sp_status_hdr where sp_status_hdr_id=a.sp_status_hdr_id) as js
        , (select top 1 code_tomenu from dbo.sp_status_hdr where sp_status_hdr_id=a.sp_status_hdr_id) as code_tomenu
        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=a.sp_type_status_id) as sp_type_statusTxt
        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
        , convert(varchar, a.d_create, 120) as d_create
        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
        , convert(varchar, a.d_update, 120) as d_update
         from ({$sqlTempTable}) a";

             $stmt = $db->QueryParam($sqlMain, $arrParam);
             $i = $start + 1;
             while ($row = $db->Fetch($stmt)) {
                 $temp = array(
                     "no" => $i++,
                     "id" => intval($row["sp_status_hdr_id"]),
                     "i_entrance" => intval($row["i_entrance"]),
                     "c_code" => $row["c_code"],
                     "sp_type_status_id" => $row["sp_type_status_id"],
                     "sp_type_statusTxt" => $row["sp_type_statusTxt"],
                     "i_alarm" => $row["i_alarm"],
                     "i_day" => $row["i_day"],
                     "js" => $row["js"],
                     "code_tomenu" => $row["code_tomenu"],
                     "i_seq" => $row["i_seq"],
                     "i_config" => $row["i_config"],
                     "c_name" => $row["c_name"],
                     "i_enabled" => $row["i_enabled"],
     
                     "dc_user_create_id" => $row["c_create_name"],
                     "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                     "d_create" => $date->extDateBuddha($row["d_create"]),
                     "dc_user_update_id" => $row["c_update_name"],
                     "dc_user_update_cost_id" => $row["c_cost_update_name"],
                     "d_update" => $date->extDateBuddha($row["d_update"])
                 );
                 ${$root}[] = $temp;
             }
             $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
             $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
             echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
             exit;
         }
         break;

 }
 if ($stmt) {
     $db->CommitTran();
     $re = array("reval" => 0, "success" => "Success", "msg" => "commit");
 } else {
     $db->RollBackTran();
     $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
 }
 echo json_encode($re);
 exit;
 
