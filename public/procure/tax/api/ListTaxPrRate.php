<?php
include("../../conf/config.php");
include("../conf/configTax.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
############################################################################################################
$type	= @$_REQUEST["type"];
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
###################
$root	= "data";
$data	= array();
###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"];
###################
if (!$util->get($start)) { $start = 0; }
if (!$util->get($limit)) { $limit = 20; }else{ $limit=($limit+$start); }
if (!$util->get($dir))	{ $dir 	= "ASC"; }
if (!$util->get($sort)) { $sort = "c_code"; }

#################################
$arrParam = array();
$arrCountParam = array();

if ($type == "main"){
    $sqlTempTable = "select tax_pr_rate_hdr_id
                    , c_code
                    , c_name
                    , c_comment
                    , isnull(convert(varchar(10), d_start, 120), '') as d_start
                    , isnull(convert(varchar(10), d_finish, 120), '') as d_finish
                    , i_enable
                    ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
                    ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
                    , convert(varchar, d_create, 120) as d_create
                    ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
                    ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
                    , convert(varchar, d_update, 120) as d_update 
                    , row_number() over (order by $sort $dir) as row 
                from vw_tax_pr_rate_hdr a
                where 1 = ?".$util->viewAcc($i_read);
                
    $arrParam[] = 1;
    if($mode=="SEARCH"){
        if (isset($filter)&&$filter!="")
        {
            $sqlTempTable .= " and ".$filter." like ?";
            $arrParam[] = "%{$value}%";
        }
    }
    
    $arrCountParam = $arrParam;
    $arrParam[] = $start;
    $arrParam[] = $limit;
    
    $sqlMain = "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while($row =$db->Fetch($stmt))				
    {
        if ($row["d_start"] != ""){
            $d_start = $date->extDateBuddha($row["d_start"]);
            $str_start = $date->shot_date_from_db($row["d_start"]);
        }else{
            $d_start = "";
            $str_start = "";
        }
        $d_finish = ($row["d_start"] != "")? $date->extDateBuddha($row["d_finish"]) : "";
        $temp = array("no" => ($i++), 
                        "id"                        => $row["tax_pr_rate_hdr_id"],
                        "c_code"                    => $row["c_code"],
                        "c_name"                    => $row["c_name"],
                        "c_comment"                 => $row["c_comment"],
                        "d_start"                   => $d_start,
                        "str_start"                 => $str_start,
                        "d_finish"                  => $d_finish,
                        "i_enable"                  => $row["i_enable"],
                        "dc_user_create_id"         => $row["c_create_name"],
                        "dc_user_create_cost_id"    => $row["c_cost_creat_name"],
                        "d_create"                  => $date->extDateBuddha($row["d_create"]),
                        "dc_user_update_id"         => $row["c_update_name"],
                        "dc_user_update_cost_id"    => $row["c_cost_update_name"],
                        "d_update"                  => $date->extDateBuddha($row["d_update"])
                    );
            ${$root}[] = $temp;
    }
} else if($type == "dtl") {
    $sqlTempTable = " SELECT
                            ROW_NUMBER() OVER (ORDER BY i_percent ASC) AS numrow
                            , a.tax_pr_rate_dtl_id
                            , a.tax_pr_rate_hdr_id
                            , a.c_comment
                            , a.f_income_min
                            , a.f_income_max
                            , a.f_amt_max
                            , a.f_pile
                            , a.f_amt_pile
                            , a.i_percent
                            ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
                            , convert(varchar, d_create, 120) as d_create
                            ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
                            , convert(varchar, d_update, 120) as d_update 
                        FROM tax_pr_rate_dtl a
                        WHERE a.tax_pr_rate_hdr_id = ?";

    $sqlMain = "SELECT * FROM ({$sqlTempTable}) a";

    $arrParam[]	= $_REQUEST["hdr_id"];
    $arrCountParam  = $arrParam;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while($row =$db->Fetch($stmt))
    {
        $temp = array(  "no"                    => $row["numrow"],
                        "id"                    => $row["tax_pr_rate_dtl_id"],
                        "tax_pr_rate_hdr_id"    => $row["tax_pr_rate_hdr_id"],
                        "c_comment"             => $row["c_comment"],
                        "f_income_min"          => $row["f_income_min"],
                        "f_income_max"          => $row["f_income_max"],
                        "f_amt_max"             => $row["f_amt_max"],
                        "f_pile"                => $row["f_pile"],
                        "f_amt_pile"            => $row["f_amt_pile"],
                        "i_percent"             => $row["i_percent"],
                        "dc_user_create_id"         => $row["c_create_name"],
                        "dc_user_create_cost_id"    => $row["c_cost_creat_name"],
                        "d_create"                  => $date->extDateBuddha($row["d_create"]),
                        "dc_user_update_id"         => $row["c_update_name"],
                        "dc_user_update_cost_id"    => $row["c_cost_update_name"],
                        "d_update"                  => $date->extDateBuddha($row["d_update"])
                    );

        ${$root}[] = $temp;
    }
}

$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>