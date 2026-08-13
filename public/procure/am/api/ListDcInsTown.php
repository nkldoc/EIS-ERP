<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/database/apiUtil.php");
include("../conf/config_am.php");
###############################################################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
###############################################################

$root	= "data";
$data	= array();

$con		= null;
$mode		= @$_REQUEST["mode"];
$i_read		= @$_REQUEST["i_read"];
$type 		= @$_REQUEST["type"];

$c_name = (!get(@$_REQUEST["c_name"]))? "" : $_REQUEST["c_name"];
$i_enable = (!get(@$_REQUEST["i_enable"]))? 0 : $_REQUEST["i_enable"];
$dc_building_id	= (!get(@$_REQUEST["dc_building_id"]))? 0 : $_REQUEST["dc_building_id"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start	= 0; }
if (!get($limit))	{ $limit	= 20; }else{ $limit=($limit+$start); }

if($type == "HDR") {
    $arrParam = array();
    $arrCountParam =  array();

    $sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY a.i_enable desc , a.c_name) as row_id
                        , a.dc_ins_town_hdr_id
                        , a.dc_building_id
                        , b.c_name as building_name
                        , a.c_name
                        , a.c_comment
                        , a.i_enable
                        , (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar(10), a.d_create, 120) as d_create
                        , (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, a.d_update, 120) as d_update
                    from dc_ins_town_hdr a
                        inner join dc_building b on a.dc_building_id = b.dc_building_id
                    where 1 = ? ".$util->viewAcc($i_read);
    $arrParam[] = 1;

    if ($c_name != "")
    {
            $sqlTempTable .= " and a.c_name like ?";
            $arrParam[] = "%{$c_name}%";
    }

    if ($i_enable > 0)
    {
            $sqlTempTable .= " and a.i_enable = ?";
            $arrParam[] = $i_enable;
    }

    if ($dc_building_id > 0)
    {
            $sqlTempTable .= " and a.dc_building_id = ?";
            $arrParam[] = $dc_building_id;
    }

    $arrCountParam[] = $arrParam;

    $arrParam[] = $start;
    $arrParam[] = $limit;

    $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row_id > ? and a.row_id <= ? order by a.row_id";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while($row =$db->Fetch($stmt))				
    {
        $temp = array("no" => ($i++), 
                        "id" => $row["dc_ins_town_hdr_id"],
                        "dc_building_id" => $row["dc_building_id"],
                        "building_name" => $row["building_name"],
                        "c_name" => $row["c_name"],
                        "c_comment" => $row["c_comment"],
                        "i_enable" => $row["i_enable"],
                        "dc_user_create_id" =>$row["c_create_name"],
                        "dc_user_create_cost_id" =>$row["c_cost_creat_name"],
                        "d_create" =>$date->extDateBuddha($row["d_create"]),
                        "dc_user_update_id" =>$row["c_update_name"],
                        "dc_user_update_cost_id" =>$row["c_cost_update_name"],
                        "d_update" =>$date->extDateBuddha($row["d_update"])
                    );
        ${$root}[] = $temp;
    }
} else if($type == "DTL") {
    $sqlMain = "select dc_ins_town_dtl_id
                    , c_code
                    , c_name
                from dc_ins_town_dtl
                where dc_ins_town_hdr_id = ?
                order by c_code";

    $arrParam[]	= $_REQUEST["dc_ins_town_hdr_id"];

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i =1;
    while($row =$db->Fetch($stmt))
    {
        $temp = array(	"no"        => ($i++),
                        "id"        => $row["dc_ins_town_dtl_id"],
                        "c_code"    => $row["c_code"],
                        "c_name"    => $row["c_name"]
        );

        ${$root}[] = $temp;
    }

    echo json_encode(array("debug"=>true, "totalCount"=>$i, $root=>${$root}));
    exit;
} else if($type == "LIST_COST") {
	
    $arrParam[]	= STATUS_ENABLE;
    $arrParam[]	= I_LAST;
    $arrParam[]	= $_REQUEST["dc_ins_town_hdr_id"];

    $where = "";
    if ($mode == "SEARCH")
    {
            $c_name = $_REQUEST["c_name"];
            $c_code = $_REQUEST["c_code"];
            $i_type_region = $_REQUEST["i_type_region"];
            if ($c_name != "")
            {
                $where .= " and c_name like ?";
                $arrParam[] = "%{$c_name}%";
            }

            if ($c_code != "")
            {
                $where .= " and c_code like ?";
                $arrParam[] = "%{$c_code}%";
            }

            if ($i_type_region > 0)
            {
                $where .= " and i_locate = ?";
                $arrParam[] = $i_type_region;
            }
    }

    $sqlMain = "select dc_cost_id, c_code, c_name
                from dc_cost 
                where i_enable = ? and i_last = ?  
                    and dc_cost_id not in (select dc_cost_id from dc_ins_town_dtl 
                                            where dc_ins_town_hdr_id = ?) 
                    {$where}
                order by c_code ASC ";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 1;
    while($row =$db->Fetch($stmt))
    {
        $temp = array(	"no"        => ($i++),
                        "id"        => $row["dc_cost_id"],
                        "c_code"    => $row["c_code"],
                        "c_name"    => $row["c_name"]
        );

        ${$root}[] = $temp;
    }
    echo json_encode(array("debug"=>true, "totalCount"=>$i, $root=>${$root}));
    exit;
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>