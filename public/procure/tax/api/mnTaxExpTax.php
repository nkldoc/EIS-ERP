<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$mode	= $_REQUEST["mode"];
$c_code_gen = "TEX";

$tableHdr = "tax_exp_tax";
$keyHdrName = "tax_exp_tax_id";
//ไม่ต้องใส่ Primary Key
$fld = array("c_code",
            "c_comment",
            "d_start",
            "d_finish",
            "f_exp_max",
            "i_percent",
            "i_enable",
            "i_delete",
            "dc_user_create_id",
            "dc_user_create_cost_id",
            "d_create",
            "dc_user_update_id",
            "dc_user_update_cost_id",
            "d_update"
        );

switch ($mode) {
    case "ADD" : 
        $data = $util->mnUser($_REQUEST);
        $data["i_delete"] 	= DELETE_FALSE;
        $data["d_start"]	= (!empty($data["d_start_input"]))? $data["d_start_input"] : null;
        $data["d_finish"]	= (!empty($data["d_finish_input"]))? $data["d_finish_input"] : null;

        $arrParam = array();
        $hdr_id = 0;
        $addField = "";
        $addValue = "";
        foreach($fld as $value)
        {
                if (!empty($data[$value]))
                {
                    $addField .= ", {$value}";
                    $addValue .= ", ?";
                    $arrParam[] = $data[$value];
                }
                else if ($value == "i_enable")
                {
                    $addField .= ", {$value}";
                    $addValue .= ", ?";
                    $arrParam[] = STATUS_DISABLE;
                }
        }

        $sql = "INSERT INTO {$tableHdr} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";
        $sql.="SELECT @@IDENTITY as hdr_id";

        $db->BeginTran();

        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt)
        {
                $next_result = $db->NextResult($stmt);
                if( $next_result ) {
                        $dd_hdr = $db->Fetch($stmt);
                        $hdr_id = $dd_hdr["hdr_id"] ;
                }

                $code_dc 	= (string) $c_code_gen;
                $arrParam2  = array($code_dc,1,1,$hdr_id);
                $sql2		="EXEC SP_GEN_CODE_DC ?,?,?,?;";
                $stmt2 		= $db->QueryParam($sql2,$arrParam2);

                $arr_gen_code = $db->Fetch($stmt2);
                $c_code 	= $arr_gen_code["c_code_gen"] ;
                $ref_id   	= $arr_gen_code["reference_id"] ;

                $stmt3 = false;
                if ($hdr_id==$ref_id)
                {
                        $sql3 = "UPDATE {$tableHdr}
                        SET c_code=?
                        WHERE {$keyHdrName} = ?";
                        $arrParam3 = array($c_code,$hdr_id);
                        $stmt3 = $db->QueryParam($sql3,$arrParam3);
                }

        }

        if ($stmt && $stmt2 && $stmt3)
        {
            $db->CommitTran();
            $re = array("reval"=>0,"success"=>"Success","msg"=>"บันทีกเรียบร้อยแล้ว");
        }
        else 
        {
            $db->RollBackTran();
            $re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
        }
    break;
    case "EDIT" :
        $data = $util->mnUser($_REQUEST);
        $data["i_delete"] 	= DELETE_FALSE;
        $data["d_start"]	= (!empty($data["d_start_input"]))? $data["d_start_input"] : null;
        $data["d_finish"]	= (!empty($data["d_finish_input"]))? $data["d_finish_input"] : null;

        $arrParam = array();
        $upField = "";
        foreach($fld as $value)
        {
                if (!empty($data[$value]))
                {
                        $upField .= ", {$value} = ?";
                        $arrParam[] = $data[$value];
                }
                else if ($value == "i_enable")
                {
                        $upField .= ", {$value} = ?";
                        $arrParam[] = STATUS_DISABLE;
                }
        }

        $sql = "UPDATE {$tableHdr}
                    SET ".substr($upField, 1)."
                WHERE {$keyHdrName} = ?";

        $arrParam[] = $data["id"];
        $db->BeginTran();
        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt)
        {
            $db->CommitTran();
            $re = array("reval"=>0,"success"=>"Success","msg"=>"บันทีกเรียบร้อยแล้ว");
        }
        else
        {
            $db->RollBackTran();
            $re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
        }
    break;
    case "DELETE" : 
        $data = $util->mnUser($_REQUEST);

        $sql = "UPDATE {$tableHdr} 
                    SET i_delete = ?
                WHERE {$keyHdrName} = ?";
        $arrParam = array(DELETE_TRUE, $data["id"]);

        $db->BeginTran();
        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt)
        {
            $db->CommitTran();
            $re = array("reval"=>0,"success"=>"Success","msg"=>"บันทีกเรียบร้อยแล้ว");
        }
        else
        {
            $db->RollBackTran();
            $re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
        }
    break;
}

echo json_encode($re);
exit;

?>