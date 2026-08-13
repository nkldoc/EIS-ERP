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
if (!$util->get($sort)) { $sort = "cast(c_code as int)"; }

#################################
$arrParam = array();
$arrCountParam = array();

if ($type == "main"){
    $sqlTempTable = "select dc_section_tax_id
                    , c_code
                    , c_name
                    , c_comment
                    , i_rank_bank
                    , i_type_tax
                    , i_enable
                    ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
                    ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
                    , convert(varchar, d_create, 120) as d_create
                    ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
                    ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
                    , convert(varchar, d_update, 120) as d_update 
                    , row_number() over (order by $sort $dir) as row 
                from vw_dc_section_tax a
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
        $temp = array("no" => ($i++), 
                        "id"                        => $row["dc_section_tax_id"],
                        "c_code"                    => $row["c_code"],
                        "c_name"                    => $row["c_name"],
                        "c_comment"                 => $row["c_comment"],
                        "i_rank_bank"               => $row["i_rank_bank"],
                        "i_type_tax"                => $row["i_type_tax"],
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
} else if($type == "method") {
    $sqlTempTable = " SELECT
                            ROW_NUMBER() OVER (ORDER BY c_name ASC) AS numrow,
                            a.dc_tax_method_id,
                            a.dc_section_tax_id,
                            a.c_code,
                            a.c_name
                        FROM DC_TAX_METHOD a
                        WHERE a.dc_section_tax_id = ?";

    $sqlMain = "SELECT * FROM ({$sqlTempTable}) a";

    $arrParam[]	= $_REQUEST["dc_section_tax_id"];
    $arrCountParam  = $arrParam;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while($row =$db->Fetch($stmt))
    {
        $temp = array(  "no"                => $row["numrow"],
                        "id"                => $row["dc_tax_method_id"],
                        "dc_section_tax_id" => $row["dc_section_tax_id"],
                        "c_code"            => $row["c_code"],
                        "c_name"            => $row["c_name"] );

        ${$root}[] = $temp;
    }
} else if($type == "sub") {
    $sqlTempTable = " SELECT ROW_NUMBER() OVER (ORDER BY a.dc_tax_customer_id ASC) AS numrow
                            , a.dc_tax_customer_id
                            , a.c_name
                            , b.dc_section_tax_sub_id
                            , b.dc_tax_id
                            , isnull((select top 1 c_name from dc_tax where dc_tax_id = b.dc_tax_id), '') as c_tax_name 
                            , b.dc_tax_income_mth_id
                            , isnull((select top 1 c_name from dc_tax_income where dc_tax_income_id = b.dc_tax_income_mth_id), '') as c_tax_income_name 
                            , b.dc_tax_income_year_id as dc_tax_income_parent_id
                            , isnull((select top 1 c_name from dc_tax_income where parent_id > 0 and parent_id = b.dc_tax_income_mth_id), '') as c_tax_income_parent_name
                        FROM dc_tax_customer a
                        LEFT JOIN dc_section_tax_sub b ON a.dc_tax_customer_id = b.dc_tax_customer_id 
                            AND b.dc_section_tax_id = ?";

    $sqlMain = "SELECT * FROM ({$sqlTempTable}) a";

    $arrParam[]	= $_REQUEST["dc_section_tax_id"];
    $arrCountParam  = $arrParam;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while($row =$db->Fetch($stmt))
    {
        $temp = array(	"no"                        => $row["numrow"],
                        "id"                        => $row["dc_section_tax_sub_id"],
                        "c_name"                    => $row["c_name"],
                        "dc_tax_customer_id"        => $row["dc_tax_customer_id"],
                        "dc_tax_id"                 => $row["dc_tax_id"],
                        "c_tax_name"                => $row["c_tax_name"],
                        "dc_tax_income_mth_id"      => $row["dc_tax_income_mth_id"],
                        "c_tax_income_name"         => $row["c_tax_income_name"],
                        "dc_tax_income_parent_id"   => $row["dc_tax_income_parent_id"] ,
                        "c_tax_income_parent_name"  => $row["c_tax_income_parent_name"]
		);

        ${$root}[] = $temp;
    }
} else if ($type == "dcTax"){
    $sqlTempTable = "SELECT dc_tax_id, c_name FROM vw_dc_tax WHERE i_enable = ?";
    $sqlMain = "SELECT * FROM ({$sqlTempTable}) a";
    $arrParam[] = STATUS_ENABLE;
    $arrCountParam  = $arrParam;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while($row =$db->Fetch($stmt))
    {
        $temp = array("id" => $row["dc_tax_id"],
                        "c_name" => $row["c_name"]
                      );

        ${$root}[] = $temp;
    }
} else if ($type == "dcTaxIncome"){
    $sqlTempTable = "SELECT dc_tax_income_id, c_name FROM vw_dc_tax_income WHERE isnull(parent_id, 0) = 0 AND i_enable = ?";
    $sqlMain = "SELECT * FROM ({$sqlTempTable}) a";
    $arrParam[] = STATUS_ENABLE;
    $arrCountParam  = $arrParam;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while($row =$db->Fetch($stmt))
    {
        $temp = array("id" => $row["dc_tax_income_id"],
                        "c_name" => $row["c_name"]
                      );
        ${$root}[] = $temp;
    }
}

$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>