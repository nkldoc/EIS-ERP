<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/config_am.php");

$db = new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$table 		= "gl_depre_hdr";
$keyName 	= "gl_depre_hdr_id";
$code_gen	= "AD";
$data = $util->mnUser($_REQUEST, "ADD");

// prepare data
$data["d_gen_date"]	= (!empty($data["d_gen_date"]))? $date->bc_to_ad($data["d_gen_date"]) : null;
$data["c_code"] = $code_gen;
$hdr_id = @$data["id"];
$last_day = date('t',mktime(0,0,0,$data["cal_month"],1,$data["cal_year"]));
$data["d_doc_date"] = $data["cal_year"]."-".$data["cal_month"]."-".$last_day;

$c_yyyy_mm = sprintf("%04d%02d", $data["cal_year"], $data["cal_month"]);
$c_yyyy_mm_previous = "";
if($data["cal_month"] == 1){
	$c_yyyy_mm_previous = sprintf("%04d%02d", ($data["cal_year"]-1), 12);
}else{
	$c_yyyy_mm_previous = sprintf("%04d%02d", $data["cal_year"], ($data["cal_month"]-1));
}

// process 
$stmt = false;
$stmt2 = false;
$stmt3 = false;
$stmt4 = false;
$stmt5 = false;

$db->BeginTran();

$arrParam = array();

if ($data["mode"] == "ADD")
{
	$arrParam[] = $code_gen; 
	$arrParam[] = $c_yyyy_mm;
	$arrParam[] = $data["d_doc_date"];
	$arrParam[] = $data["d_gen_date"];
	$arrParam[] = STATUS_ENABLE;
	$arrParam[] = $data["dc_user_create_id"];
	$arrParam[] = $data["dc_user_create_cost_id"];
	$arrParam[] = $data["dc_user_update_id"];
	$arrParam[] = $data["dc_user_update_cost_id"];
	//where
	$arrParam[] = $data["asset_type"];
	$arrParam[] = STATUS_ENABLE;
	
	$sql = "insert into gl_depre_hdr(dc_asset_type_id, c_name, ref_c_code, c_code, c_yyyy_mm, d_doc_date, d_gen_date, i_is_posted, i_enable, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update)
                select dc_asset_type_id
                    , c_name
                    , c_code as ref_c_code
                    , ? as c_code
                    , ? as c_yyyy_mm
                    , ? as d_doc_date
                    , ? as d_gen_date
                    , 0 as i_is_posted
                    , ? as i_enable
                    , ? as dc_user_create_id
                    , ? as dc_user_create_cost_id
                    , getdate() as d_create
                    , ? as dc_user_update_id
                    , ? as dc_user_update_cost_id
                    , getdate() as d_update
                from vw_dc_asset_type
                where c_code = ? and i_enable = ?;";
	$sql.="SELECT @@IDENTITY as hdr_id";
	$stmt = $db->QueryParam($sql, $arrParam);
	if ($stmt)
	{
            $next_result = $db->NextResult($stmt);
            if( $next_result ) {
                $dd_hdr = $db->Fetch($stmt);
                $hdr_id = $dd_hdr["hdr_id"] ;
            }
	}
}
else
{
	$stmt = true;
}

// ลบข้อมูลเก่า
$sql = "EXEC SP_AM_DELETE_DEPRE ?, ?, ?, ?, ?";
$stmt2 = $db->QueryParam($sql, array($hdr_id, $data["asset_type"], $c_yyyy_mm, STATUS_ENABLE, STATUS_DISABLE));

if ($stmt2)
{
    //echo "{$sql} (".$hdr_id.", ".$data["asset_type"].", ".$c_yyyy_mm.", ".STATUS_ENABLE.", ".STATUS_DISABLE.")<hr />";
    // คำนวณค่าเสื่อมลง gl_depre_dtl
    $sql = "EXEC SP_AM_CALCULATE_DEPRE ?;";
    $stmt3 = $db->QueryParam($sql, array($hdr_id));
    
    if ($stmt3)
    {
        //echo "{$sql} (".$hdr_id.", ".$data["d_doc_date"].", ".$c_yyyy_mm.", ".$c_yyyy_mm_previous.", ".$data["asset_type"].", ".$data["dc_user_create_id"].", ".$data["dc_user_create_cost_id"].")<hr />";
        // สรุปข้อมูลจาก gl_depre_dtl มาบันทึกที่ gl_asset_depre
        $sql = "EXEC SP_AM_ASSET_DEPRE ?";
        $stmt4 = $db->QueryParam($sql, array($hdr_id));

        if ($stmt4)
        {
            //echo "{$sql} (".$hdr_id.")<hr />";
            // Gen Code
            list($yyyy, $mm, $dd) = explode("-",@$data["d_gen_date"]);
            $c_yyyy_mm = $yyyy.$mm;
            $arrParamGencode    = array($code_gen,$c_yyyy_mm,$data["dc_user_update_id"],$data["dc_user_update_cost_id"],$hdr_id);
            $sqlGenCode         = "EXEC SP_GEN_CODE ?,?,?,?,?;";
            $stmtGenCode        = $db->QueryParam($sqlGenCode,$arrParamGencode);

            $arr_gen_code       = $db->Fetch($stmtGenCode);
            $c_code             = $arr_gen_code["c_code_gen"] ;
            $ref_id             = $arr_gen_code["reference_id"] ;

            if ($hdr_id==$ref_id)
            {
                $sql = "UPDATE {$table}
                        SET c_code = ?
                        WHERE {$keyName} = ?;";

                $stmt5 = $db->QueryParam($sql, array($c_code, $hdr_id));
            }

            $code_gen = $c_code;
        }
    }
}

if ($stmt && $stmt2 && $stmt3 && $stmt4 && $stmt5)
{
	$db->CommitTran();
	$re = array("reval"=>0,"success"=>"Success","msg"=>"commit","hdr_id"=>$hdr_id,"c_code_gen"=>$code_gen);
}
else
{
	$db->RollBackTran();
	$re = array("reval"=>1,"success"=>"Error","msg"=>"check statement : {$sql}");
}
 
echo json_encode($re);
exit;

?>