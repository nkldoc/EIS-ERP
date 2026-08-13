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
$type		= @$_REQUEST["type"];
$mode		= @$_REQUEST["mode"];
$i_read		= @$_REQUEST["i_read"];

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

if (!get($start))	{ $start = 0; }
if (!get($limit))	{ $limit = 20; }else{ $limit=($limit+$start); }

if($type == "HDR") {
    $year = (!get(@$_REQUEST["year"])) ? date('Y') : $_REQUEST["year"];
    $sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY c_code desc) as row 
                        , gl_depre_hdr_id 
                        , substring(c_yyyy_mm,1,4) as y1 
                        , substring(c_yyyy_mm,5,6) as m1 
                        , c_code 
                        , c_name 
                        , isnull(CONVERT(varchar(10), d_doc_date, 120),'') as d_doc_date 
                        , isnull(CONVERT(varchar(10), d_gen_date, 120),'') as d_gen_date 
                        , isnull((select sum(f_depre_amt) from gl_depre_dtl where gl_depre_hdr_id= a.gl_depre_hdr_id),0) as sumdepre 
                        , ref_c_code
                        , i_enable 
                        ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
                        ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar(10), d_create, 120) as d_create
                        ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
                        ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, d_update, 120) as d_update
                    from gl_depre_hdr a
                    where substring(a.c_yyyy_mm,1,4) = ?".$util->viewAcc($i_read);

    if($mode=="SEARCH"){
        $arrParam = array();
        $arrCountParam =  array();

        $month 		= @$_REQUEST["month"];
        $c_code 	= @$_REQUEST["c_code"];
        $enable 	= @$_REQUEST["enable"];
        $asset_group_code = @$_REQUEST["asset_group_code"];

        $arrParam[] = $year;
        $arrCountParam[] = $year;

        $sqlTempTable .= " and substring(c_yyyy_mm,5,6) = ? ";
        $arrParam[] = $month;
        $arrCountParam[] = $month;

        if ($c_code != "")
        {
            $sqlTempTable .= " and a.c_code like ?";
            $arrParam[] = "%{$c_code}%";
            $arrCountParam[] = "%{$c_code}%";
        }

        if ($enable != "0")
        {
            $sqlTempTable .= " and a.i_enable = ?";
            $arrParam[] = $enable;
            $arrCountParam[] = $enable;
        }

        if ($asset_group_code != "")
        {
            $sqlTempTable .= " and a.ref_c_code like ?";
            $arrParam[] = "{$asset_group_code}%";
            $arrCountParam[] = "{$asset_group_code}%";
        }

        $arrParam[] = $start;
        $arrParam[] = $limit;

        $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
    } else {
        $sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        // parameter ของ ชุดแสดงรายการ
        $arrParam = array($year, $start, $limit);
        // parameter ของ ชุดนับจำนวนรายการ
        $arrCountParam =  array($year);
    }


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

            $strGenDate = "";
            $cGenDate = "";
            if (($row["d_gen_date"] != ""))
            {
                    $strGenDate = $date->shot_date_from_db($row["d_gen_date"]);
                    $cGenDate = $date->extDateBuddha($row["d_gen_date"]);
            }

            $strMY = $date->l_month_thai[$row["m1"]]." ".($row["y1"]+543);

            $temp = array("no" => ($i++), 
                            "id" => $row["gl_depre_hdr_id"],
                            "c_code" => $row["c_code"],
                            "m1" => $row["m1"],
                            "y1" => $row["y1"],
                            "strMY"	=> $strMY,
                            "c_name" => $row["c_name"],
                            "d_doc_date" => $strDocDate,
                            "str_doc_date"	=> $cDocDate,
                            "d_gen_date" => $strGenDate,
                            "str_gen_date"	=> $cGenDate,
                            "f_depre" => $row["sumdepre"],
                            "ref_c_code" => $row["ref_c_code"],
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

    $sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
    echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
    exit;
	
} else if ($type == "CHECK_CALCULATE"){
	
    $id = $_REQUEST["id"];
    $asset_type = $_REQUEST["asset_type"];
    $cal_month = sprintf('%02d',$_REQUEST["cal_month"]);
    $cal_year = $_REQUEST["cal_year"];

    if ($id > 0)
            $whereID = " and gl_depre_hdr_id <> @id";
    else 
            $whereID = "";

    $sql = "declare @i_massage as tinyint = 0;
            declare @max_yyyy_mm as varchar(6) = '';
            declare @asset_name as varchar(250) = '';

            declare @id as bigint;
            declare @asset_code as varchar(4);
            declare @cal_month as varchar(2);
            declare @cal_year as varchar(4);

            set @id = ?;
            set @asset_code = ?;
            set @cal_month = ?;
            set @cal_year = ?;

            select @asset_name = c_name from dc_asset_type where c_code = @asset_code;

            if ((select count(b.dc_acc_id)
                    from dc_asset_type a
                        inner join dc_acc b on b.dc_acc_id = isnull(a.dc_acc_cr_id ,a.dc_acc_dr_id)
                    where a.c_code = @asset_code and a.i_enable = ".STATUS_ENABLE." and isnull(a.i_delete,".DELETE_FALSE.") = ".DELETE_FALSE.") = 0)
                    set @i_massage = 1;
            else 
            begin
                /*หาเดือนที่ประมวลล่าสุด*/
                select @max_yyyy_mm = isnull(max(c_yyyy_mm),'') from gl_depre_hdr where i_enable = 1 and ref_c_code = @asset_code {$whereID};

                /*เคยประมวลหรือไม่*/
                if (@max_yyyy_mm != '')
                begin
                    /*ประมวลซ้ำ*/
                    if (convert(datetime, SUBSTRING(@max_yyyy_mm,1,4)+'-'+SUBSTRING(@max_yyyy_mm,5,2)+'-01', 102) > dateadd(MM,-1, convert(datetime, @cal_year+'-'+@cal_month+'-01', 102)))
                    begin
                        declare @i_post as tinyint;

                        select @i_post = a.i_is_post from gl_tran_hdr a
                            inner join gl_depre_hdr b on a.c_ref_doc = b.c_code
                        where b.i_enable = ".STATUS_ENABLE." and a.i_enable = ".STATUS_ENABLE."
                            and b.ref_c_code = @asset_code and b.c_yyyy_mm = @cal_year+@cal_month
                            {$whereID};

                        if (@i_post = 3) /*GL*/
                            set @i_massage = 2;
                        else
                        begin
                            if (@i_post = 2) /*GX*/
                                set @i_massage = 3;
                            else
                                set @i_massage = 4;
                        end

                    end
                    else
                    begin
                        /* ตรวจสอบประมวลข้ามเดือน */
                        if (convert(datetime, SUBSTRING(@max_yyyy_mm,1,4)+'-'+SUBSTRING(@max_yyyy_mm,5,2)+'-01', 102) != dateadd(MM,-1, convert(datetime, @cal_year+'-'+@cal_month+'-01', 102)))
                            set @i_massage = 5;
                    end
                end
            end

            select @i_massage as i_msg , @max_yyyy_mm as max_yyyymm_cal, @asset_name as asset_name;";

    $dataHdr = $db->GetDataBySQL($sql, array($id, $asset_type, $cal_month, $cal_year));

    if ($dataHdr["max_yyyymm_cal"] != "")
    {
        $yyyy = substr($dataHdr["max_yyyymm_cal"],0,4);
        $mm = substr($dataHdr["max_yyyymm_cal"],4,2);
        $max_month = $date->l_month_thai[$mm].' '.($yyyy+543);
    }
    $current_month = $date->l_month_thai[$cal_month].' '.($cal_year+543);

    $msg = "";
    $disBU = false;
    switch($dataHdr["i_msg"])
    {
            case 1 :
                    $msg = "ระบบไม่สามารถคำนวณค่าเสื่อมราคาสินทรัพย์ตามเงื่อนไขที่ระบุได้<br />เนื่องจากรายการสินทรัพย์ต่อไปนี้ ยังไม่ได้ผูกบัญชีค่าเสื่อมราคา และค่าเสื่อมราคาสะสม";
                    $disBU = true;
                    break;
            case 2 :
                    $msg = "ระบบได้บันทึกบัญชีค่าเสื่อมราคาสินทรัพย์  หมวด ({$asset_type}) ".$dataHdr["asset_name"]."<br />ผ่านรายการบัญชี (GL) แล้ว และคำนวณค่าเสื่อมราคาถึง เดือน {$max_month} <br />ไม่สามารถปรับปรุงบัญชีโดยอัตโนมัติได้  กรุณาปรับปรุงบัญชีรายการดังกล่าวในสมุดรายวันด้วยตนเอง";
                    $disBU = true;
                    break;
            case 3 :
                    $msg = "ระบบได้บันทึกบัญชีค่าเสื่อมราคาสินทรัพย์ (GX) หมวด ({$asset_type}) ".$dataHdr["asset_name"]."<br />และคำนวณค่าเสื่อมราคาถึง เดือน {$max_month} แล้ว<br />หากต้องการคำนวณค่าเสื่อมราคาสินทรัพย์เดือน {$current_month} ใหม่<br />ผู้ใช้งานจะต้องคำนวณค่าเสื่อมราคาสินทรัพย์ใหม่ตั้งแต่เดือน {$current_month} - {$max_month} ด้วย";
                    $disBU = false;
                    break;
            case 4 :
                    $msg = "ระบบได้คำนวณค่าเสื่อมราคาสินทรัพย์ หมวด ({$asset_type}) ".$dataHdr["asset_name"]." <br />ถึงเดือน {$max_month} แล้ว<br />หากต้องการคำนวณค่าเสื่อมราคาสินทรัพย์ เดือน {$current_month} ใหม่ <br />ผู้ใช้งานจะต้องคำนวณค่าเสื่อม ราคาสินทรัพย์ใหม่ตั้งแต่เดือน {$current_month} - {$max_month} ด้วย";
                    $disBU = false;
                    break;
            case 5 :
                    $msg = "ระบบได้คำนวณค่าเสื่อมราคาสินทรัพย์ หมวด ({$asset_type}) ".$dataHdr["asset_name"]."<br /> ถึงเดือน {$max_month}ไม่สามารถคำนวณข้ามเดือนได้";
                    $disBU = true;
                    break;
    }

    ${$root}[] = array("i_msg"=>$dataHdr["i_msg"]
                        ,"msg"=>$msg
                        ,"disBU"=>$disBU
    );

    echo json_encode(array("success"=>true, $root=>${$root}));
    exit;
}else if($type == "VIEW"){
    $gl_depre_hdr_id = $_REQUEST["gl_depre_hdr_id"];

    // title
    $sql_hdr = "select right(c_yyyy_mm, 2) as c_mm
                                    , left(c_yyyy_mm, 4) as c_yyyy
                                    , ref_c_code
                                    , c_name
                                    , convert(varchar(10), d_gen_date, 120) as d_gen_date
                                    , c_code
                            from gl_depre_hdr where gl_depre_hdr_id = ?";
    $dataHdr = $db->GetDataBySQL($sql_hdr, array($gl_depre_hdr_id));

    $print = '<TABLE id="master" style="width:100%;" border="0" cellspacing="0">'.
                    '<TR><TH style="text-align:center;">ค่าเสื่อมราคาประจำเดือน '.$date->l_month_thai[$dataHdr["c_mm"]].' พ.ศ.'.($dataHdr["c_yyyy"]+543).'</TH></TR>'.
                    '<TR><TH style="text-align:center;">หมวดสินทรัพย์ '.$dataHdr["ref_c_code"].' : '.$dataHdr["c_name"].'</TH></TR>'.
                    '<TR><TH style="text-align:center;">วันที่บันทึกรายการ : '.$date->long_date_from_db($dataHdr["d_gen_date"]).'</TH></TR>'.
                    '<TR><TH style="text-align:center;">เลขที่เอกสาร : '.$dataHdr["c_code"].'</TH></TR>'.
                '</TABLE>';

    $i_count_itmes = 0;
    $i_count_all_itmes = 0;
    $i_count_cost = 0;
    $cost_temp_id= 0;

    $f_cost = 0;
    $f_ruins = 0;
    $f_begin = 0;
    $f_depre = 0;
    $f_after = 0;
    $f_acc = 0;

    $all_cost = 0;
    $all_ruins = 0;
    $all_begin = 0;
    $all_depre = 0;
    $all_after = 0;
    $all_acc = 0;

    $top_left_right = "border-top: 1px solid Black; border-top-width: 1px; border-left: 1px solid Black; border-left-width: 1px; border-right: 1px solid Black; border-right-width: 1px; border-bottom: 1px solid Black; border-bottom-width: 1px;";
    $top_right = "border-top: 1px solid Black; border-top-width: 1px; border-right: 1px solid Black; border-right-width: 1px; border-bottom: 1px solid Black; border-bottom-width: 1px;";

    $no_top = "border-left: 1px solid Black; border-left-width: 1px; border-right: 1px solid Black; border-right-width: 1px; border-bottom: 1px solid Black; border-bottom-width: 1px;";
    $left_side = "border-bottom:1px solid Black; border-bottom-width:1px; border-right: 1px solid Black; border-right-width: 1px;";

    $print .= '<TABLE style="width:100%; font-size:12px;" border="0" cellspacing="0" cellpadding="1">'.
                    '<TR bgcolor="#C6D2D1">'.
                        '<TH style="text-align:center; '.$top_left_right.'">รหัสสินทรัพย์</TH>'.
                        '<TH style="text-align:center; '.$top_right.'">ชื่อสินทรัพย์</TH>'.
                        '<TH style="text-align:center; '.$top_right.'">วันที่ได้มา</TH>'.
                        '<TH style="text-align:center; '.$top_right.'">ราคาทุน</TH>'.

                        '<TH style="text-align:center; '.$top_right.'">มูลค่าซาก</TH>'.
                        '<TH style="text-align:center; '.$top_right.'">วันที่เริ่มต้นคิดค่าเสื่อมราคา</TH>'.
                        '<TH style="text-align:center; '.$top_right.'">อายุใช้งาน (ปี)</TH>'.
                        '<TH style="text-align:center; '.$top_right.'">ค่าเสื่อมราคาสะสมยกมา</TH>'.

                        '<TH style="text-align:center; '.$top_right.'">ค่าเสื่อมราคาประจำเดือน</TH>'.
                        '<TH style="text-align:center; '.$top_right.'">ค่าเสื่อมราคาสะสมยกไป</TH>'.
                        '<TH style="text-align:center; '.$top_right.'">ราคาตามบัญชี</TH>'.
                    '</TR>';
	
    $sql = "select b.dc_cost_id
                , b.c_code+' '+b.c_name as cost_name
                , c.c_code as asset_code
                , d.c_name as asset_name
                , isnull(convert(varchar(10),d.d_receive_date,120),'') as d_receive_date
                , isnull(c.f_unit_cost,0.00) as f_unit_cost
                , isnull(c.c_cost_ruins,0.00) as c_cost_ruins
                , isnull(convert(varchar(10),d.d_depreciate,120),'') as d_depreciate
                , c.i_period_year
                , isnull(a.f_depreciate_af, 0.00) as f_depreciate_af
                , isnull(a.f_depre, 0.00) as f_depre
                , isnull(a.f_salv, 0.00) as f_salv
                , isnull(a.acc_depre_cost, 0.00) as acc_depre_cost
            from gl_asset_depre a
                inner join dc_cost b on a.dc_cost_id = b.dc_cost_id
                inner join dc_asset c on a.dc_asset_id = c.dc_asset_id
                inner join am_tran_rg_dtl d on c.am_tran_rg_dtl_id = d.am_tran_rg_dtl_id
            where a.gl_depre_hdr_id = ?
            order by cost_name";

    $stmt = $db->QueryParam($sql, array($gl_depre_hdr_id));
    while($row =$db->Fetch($stmt))
    {
        if ($row["dc_cost_id"] != $cost_temp_id)
        {
            $i_count_cost++;

            if ($i_count_itmes > 0) // show sum cost
            {
                $print .= '<TR bgcolor="#E2E8E9">'.
                                '<TH style="text-align:right; '.$no_top.'" colspan="3">รวม '.number_format($i_count_itmes,0).' รายการ</TH>'.
                                '<TH style="text-align:right; '.$left_side.'">'.number_format($f_cost, 2).'</TH>'.
                                '<TH style="text-align:right; '.$left_side.'">'.number_format($f_ruins, 2).'</TH>'.
                                '<TH style="text-align:right; '.$left_side.'">&nbsp;</TH>'.
                                '<TH style="text-align:right; '.$left_side.'">&nbsp;</TH>'.
                                '<TH style="text-align:right; '.$left_side.'">'.number_format($f_begin, 2).'</TH>'.
                                '<TH style="text-align:right; '.$left_side.'">'.number_format($f_depre, 2).'</TH>'.
                                '<TH style="text-align:right; '.$left_side.'">'.number_format($f_after, 2).'</TH>'.
                                '<TH style="text-align:right; '.$left_side.'">'.number_format($f_acc, 2).'</TH>'.
                            '</TR>';

                $i_count_itmes = 0;

                $f_cost = 0;
                $f_ruins = 0;
                $f_begin = 0;
                $f_depre = 0;
                $f_after = 0;
                $f_acc = 0;
            }

            $print .= '<TR bgcolor="#E2E8E9">'.
                            '<TH style="text-align:left; '.$no_top.'" colspan="11">หน่วยงาน : '.$row["cost_name"].'</TH>'.
                        '</TR>';
            $cost_temp_id = $row["dc_cost_id"];
        }

        $i_count_itmes++;
        $i_count_all_itmes++;

        $receive_date = ($row["d_receive_date"] != "") ? $date->shot_date_from_db($row["d_receive_date"]) : "";
        $depre_date = ($row["d_depreciate"] != "") ? $date->shot_date_from_db($row["d_depreciate"]) : "";
        $print .= '<TR>'.
                        '<TD style="text-align:center; '.$no_top.'" nowrap>'.$row["asset_code"].'</TD>'.
                        '<TD style="text-align:left; '.$left_side.'">'.$row["asset_name"].'</TD>'.
                        '<TD style="text-align:center; '.$left_side.'" nowrap>'.$receive_date.'</TD>'.
                        '<TD style="text-align:right; '.$left_side.'" nowrap>'.number_format($row["f_unit_cost"], 2).'</TD>'.
                        '<TD style="text-align:right; '.$left_side.'" nowrap>'.number_format($row["c_cost_ruins"], 2).'</TD>'.
                        '<TD style="text-align:center; '.$left_side.'" nowrap>'.$depre_date.'</TD>'.
                        '<TD style="text-align:center; '.$left_side.'" nowrap>'.$row["i_period_year"].'</TD>'.
                        '<TD style="text-align:right; '.$left_side.'" nowrap>'.number_format($row["f_depreciate_af"], 2).'</TD>'.
                        '<TD style="text-align:right; '.$left_side.'" nowrap>'.number_format($row["f_depre"], 2).'</TD>'.
                        '<TD style="text-align:right; '.$left_side.'" nowrap>'.number_format($row["f_salv"], 2).'</TD>'.
                        '<TD style="text-align:right; '.$left_side.'" nowrap>'.number_format($row["acc_depre_cost"], 2).'</TD>'.
                    '</TR>';

        $f_cost += $row["f_unit_cost"];
        $f_ruins += $row["c_cost_ruins"];
        $f_begin += $row["f_depreciate_af"];
        $f_depre += $row["f_depre"];
        $f_after += $row["f_salv"];
        $f_acc += $row["acc_depre_cost"];

        $all_cost += $row["f_unit_cost"];
        $all_ruins += $row["c_cost_ruins"];
        $all_begin += $row["f_depreciate_af"];
        $all_depre += $row["f_depre"];
        $all_after += $row["f_salv"];
        $all_acc += $row["acc_depre_cost"];
    }

    if ($i_count_itmes > 0) // show sum cost
    {
        $print .= '<TR bgcolor="#E2E8E9">'.
                    '<TH style="text-align:right; '.$no_top.'" colspan="3">รวม '.number_format($i_count_itmes,0).' รายการ</TH>'.
                    '<TH style="text-align:right; '.$left_side.'">'.number_format($f_cost, 2).'</TH>'.
                    '<TH style="text-align:right; '.$left_side.'">'.number_format($f_ruins, 2).'</TH>'.
                    '<TH style="text-align:right; '.$left_side.'">&nbsp;</TH>'.
                    '<TH style="text-align:right; '.$left_side.'">&nbsp;</TH>'.
                    '<TH style="text-align:right; '.$left_side.'">'.number_format($f_begin, 2).'</TH>'.
                    '<TH style="text-align:right; '.$left_side.'">'.number_format($f_depre, 2).'</TH>'.
                    '<TH style="text-align:right; '.$left_side.'">'.number_format($f_after, 2).'</TH>'.
                    '<TH style="text-align:right; '.$left_side.'">'.number_format($f_acc, 2).'</TH>'.
                '</TR>';
    }

    if ($i_count_cost > 0) // show sum all
    {
        $print .= '<TR bgcolor="#C6D2D1">'.
                        '<TH style="text-align:right; '.$no_top.'" colspan="3">รวม '.number_format($i_count_cost,0).' หน่วยงาน รวมทั้งหมด '.number_format($i_count_all_itmes,0).' รายการ</TH>'.
                        '<TH style="text-align:right; '.$left_side.'">'.number_format($all_cost, 2).'</TH>'.
                        '<TH style="text-align:right; '.$left_side.'">'.number_format($all_ruins, 2).'</TH>'.
                        '<TH style="text-align:right; '.$left_side.'">&nbsp;</TH>'.
                        '<TH style="text-align:right; '.$left_side.'">&nbsp;</TH>'.
                        '<TH style="text-align:right; '.$left_side.'">'.number_format($all_begin, 2).'</TH>'.
                        '<TH style="text-align:right; '.$left_side.'">'.number_format($all_depre, 2).'</TH>'.
                        '<TH style="text-align:right; '.$left_side.'">'.number_format($all_after, 2).'</TH>'.
                        '<TH style="text-align:right; '.$left_side.'">'.number_format($all_acc, 2).'</TH>'.
                    '</TR>';
    }
    $print .= "</TABLE>";
    echo json_encode(array("doc_name"=>$print));
    exit();
}

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>