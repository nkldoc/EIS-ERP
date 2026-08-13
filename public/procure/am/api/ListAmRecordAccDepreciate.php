<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/database/apiUtil.php");
include("../conf/config_am.php");
include("../../gl/conf/configGl.php");
###############################################################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
###############################################################

$root	= "data";
$data	= array();

$con		= null;
$type		= @$_REQUEST["type"];
$mode		= @$_REQUEST["mode"];
$i_read		= @$_REQUEST["i_read"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start = 0; }
if (!get($limit))	{ $limit = 20; }else{ $limit=($limit+$start); }

if($type == "HDR") {
    $arrParam = array();
    $arrCountParam =  array();

    $d_begin = (!get(@$_REQUEST["d_begin"])) ? date("Y-m-d", mktime(0, 0, 0, (date('m')-1), 1, date('Y'))) : substr($_REQUEST["d_begin"],0, 10);
    $d_end = (!get(@$_REQUEST["d_end"])) ? date("Y-m-d") : substr($_REQUEST["d_end"],0, 10);

    $arrParam[] = STATUS_ENABLE;
    $arrCountParam[] = STATUS_ENABLE;

    $arrParam[] = $d_begin;
    $arrCountParam[] = $d_begin;

    $arrParam[] = $d_end;
    $arrCountParam[] = $d_end;

    $sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY a.c_code desc) as row 
                        , a.gl_depre_hdr_id
                        , isnull(convert(varchar(10), a.d_doc_date, 120), '') as d_doc_date
                        , a.c_code
                        , a.c_name
                        , sum(isnull(b.f_depre_amt,0)) as f_depre
                        , a.i_is_posted
                        , substring(a.c_yyyy_mm,1,4) as y1 
                        , substring(a.c_yyyy_mm,5,6) as m1 
                        ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
                        ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar(10), d_create, 120) as d_create
                        ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
                        ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, d_update, 120) as d_update
                    from gl_depre_hdr a
                            inner join gl_depre_dtl b on a.gl_depre_hdr_id = b.gl_depre_hdr_id
                    where a.i_enable = ?
                        and case a.c_code when '0' then 'AD' else a.c_code end != 'AD' 
                        and a.d_doc_date between CONVERT(DATETIME,?,102) and CONVERT(DATETIME,?+' 23:59:59 ',102)
                        ".$util->viewAcc($i_read)."
                    ";
	
    if($mode=="SEARCH"){

        $c_code             = @$_REQUEST["c_code"];
        $asset_group_code   = @$_REQUEST["asset_group_code"];
        $i_is_post          = @$_REQUEST["i_is_post"];

        if ($c_code != "")
        {
                $sqlTempTable .= " and a.c_code like ?";
                $arrParam[] = "%{$c_code}%";
                $arrCountParam[] = "%{$c_code}%";
        }
		
        if ($i_is_post == "1")
        {
                $sqlTempTable .= " and a.i_is_posted = ?";
                $arrParam[] = ASSET_CAL_POST_YES;
                $arrCountParam[] = ASSET_CAL_POST_YES;
        }
        else if ($i_is_post == "2")
        {
                $sqlTempTable .= " and a.i_is_posted = ?";
                $arrParam[] = ASSET_CAL_POST_NO;
                $arrCountParam[] = ASSET_CAL_POST_NO;
        }

        if ($asset_group_code != "")
        {
                $sqlTempTable .= " and a.ref_c_code like ?";
                $arrParam[] = "{$asset_group_code}%";
                $arrCountParam[] = "{$asset_group_code}%";
        }
		
    }
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlTempTable .="group by a.gl_depre_hdr_id
                        , a.d_doc_date
                        , a.c_code
                        , a.c_name
                        , a.i_is_posted
                        , a.c_yyyy_mm
                        , a.dc_user_create_id
                        , a.dc_user_create_cost_id
                        , a.d_create
                        , a.dc_user_update_id
                        , a.dc_user_update_cost_id
                        , a.d_update";
	
    $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while($row =$db->Fetch($stmt))				
    {
        $strDocDate = "";
        $cDocDate = "";
        if (($row["d_doc_date"] != ""))
        {
            $strDocDate = $date->shot_date_from_db($row["d_doc_date"]);
            $cDocDate = $date->extDateBuddha($row["d_doc_date"]);
        }
        $strMY = $date->l_month_thai[$row["m1"]]." ".($row["y1"]+543);

        $temp = array("no" => ($i++), 
                        "id" => $row["gl_depre_hdr_id"],
                        "d_doc_date" => $strDocDate,
                        "str_doc_date"	=> $cDocDate,
                        "c_code" => $row["c_code"],
                        "c_name" => $row["c_name"],
                        "f_depre" => $row["f_depre"],
                        "i_is_posted" => $row["i_is_posted"],
                        "strM" => $date->l_month_thai[$row["m1"]],
                        "strY" => ($row["y1"]+543),
                        "strMY" => $strMY,
                        "dc_user_create_id" =>$row["c_create_name"],
                        "dc_user_create_cost_id" =>$row["c_cost_creat_name"],
                        "d_create" =>$date->extDateBuddha($row["d_create"]),
                        "dc_user_update_id" =>$row["c_update_name"],
                        "dc_user_update_cost_id" =>$row["c_cost_update_name"],
                        "d_update" =>$date->extDateBuddha($row["d_update"])
                    );
        ${$root}[] = $temp;
    }
	
    $sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
    echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
    exit;
	
} else if ($type == "DTL"){
	$hdr_id =  @$_REQUEST["id"];
	$sql = "select b.parent_code, b.parent_name
                    , c.c_code as cost_code, c.c_name as cost_name
                    , sum(isnull(a.f_depre_amt,0)) as f_depre_amt
                from gl_depre_dtl a
                    inner join (select aa.dc_asset_type_id, aa.c_code, aa.c_name, bb.c_code as parent_code, bb.c_name as parent_name 
                                            from dc_asset_type aa
                                                    inner join dc_asset_type bb on aa.parent_id = bb.dc_asset_type_id) b on a.dc_asset_type_id = b.dc_asset_type_id
                    inner join dc_cost c on a.dc_cost_acc_id = c.dc_cost_id
                where a.gl_depre_hdr_id = ?
                group by b.parent_code, b.parent_name, c.c_code, c.c_name
                order by b.parent_code, b.parent_name, c.c_code";
	$stmt = $db->QueryParam($sql, array($hdr_id));
	$i_count = 0;
	$temp_code = "";
	$temp_name = "";
	$sum_type = 0;
	$sum_all = 0;
	while($row =$db->Fetch($stmt))
	{
		// ประเภทสินทรัพย์
		if ($temp_code != $row["parent_code"])
		{
			if ($sum_type > 0)
			{
				${$root}[] = array("c_code"=>"", "c_name"=>"รวมค่าเสื่อมราคา {$temp_name}", "f_depre"=>$sum_type, "i_type"=>2);
				$i_count++;
				$sum_type = 0;
			}
			
			$temp_code = $row["parent_code"];
			$temp_name = $row["parent_name"];
			${$root}[] = array("c_code"=>"{$temp_code} : {$temp_name}", "c_name"=>"", "f_depre"=>"", "i_type"=>1);
			$i_count++;
		}
		
		${$root}[] = array("c_code"=>$row["cost_code"], "c_name"=>$row["cost_name"], "f_depre"=>$row["f_depre_amt"], "i_type"=>4);
		$i_count++;
		$sum_type += $row["f_depre_amt"];
		$sum_all += $row["f_depre_amt"];
	}// end while
	
	if ($sum_type > 0)
	{
            ${$root}[] = array("c_code"=>"", "c_name"=>"รวมค่าเสื่อมราคา {$temp_name}", "f_depre"=>$sum_type, "i_type"=>2);
            $i_count++;
	}
	
	if ($sum_all > 0)
	{
            ${$root}[] = array("c_code"=>"", "c_name"=>"รวมทั้งหมด", "f_depre"=>$sum_all, "i_type"=>3);
            $i_count++;
	}
	echo json_encode(array("debug"=>true, "totalCount"=>$i_count, $root=>${$root}));
	exit;
} else if($type == "CHECK_CLOSE"){
	
	$d_save_date = $date->bc_to_ad($_REQUEST["d_save_date"]);
	$i_status = 0;
	$sql = "declare @d_save_date as varchar(10);
                set @d_save_date = ?;
                select isnull(sum(i_status),0) as i_status 
                from gl_dc_period 
                where i_system = ? and i_last_period = ?
                    and cast(c_mm as int) = month(convert(datetime,@d_save_date,102))
                    and cast(c_yyyy as int) = year(convert(datetime,@d_save_date,102));";
	$i_status = $db->GetDataBySQL($sql, array($d_save_date, GL_PERIOD_SYSTEM_GL, GL_LAST_PERIOD_TRUE));
	$msg = "";
	$check = true;
	if ($i_status > 0)
	{
            if ($i_status == 2)
            {
                $mm = substr($d_save_date, 5, 2);
                $msg = "ระบบได้ปิดงวดเดือน ".($date->l_month_thai[$mm])." แล้ว";
                $check = false;
            }
	}
	else
	{
            $msg = "ยังไม่บันทึกงวดบัญชี";
            $check = false;
	}
	
	echo json_encode(array("success"=>true, "chk"=>$check, "msg"=>$msg));
	exit;
} else if ($type == "GET_GX"){
    $sql = "select a.c_code from gl_tran_hdr a
                inner join gl_depre_hdr b on a.c_ref_doc = b.c_code
            where b.gl_depre_hdr_id = ? and a.i_enable=? and left(a.c_code,1)='G' and a.i_is_close_year=?";
    $gx_code = $db->GetDataBySQL($sql, array($_REQUEST["gl_depre_hdr_id"],1,2));

    echo json_encode(array("success"=>true, "gxcode"=>$gx_code));
    exit;
}

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>