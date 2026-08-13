<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../conf/config_am.php");
include("../../../lib/date/i_date.class.php");

function headerX($t='',$rd){
		 
	$title= $_REQUEST['titleReport'];
	$tt = isset($t) && $t!=''?true:false;
	switch($t)
	{ 
		case 'excel': $ttt = 'xls'; break; 
		case 'downloadHTML': $ttt = 'html'; break;  
		case 'html': $ttt 	= ''; break;
		default: $ttt='';
	} 
	if($ttt!=''){ //file include is not spacing outer tag php
		header("Content-Type: application/octet-stream");
		header("Content-Transfer-Encoding: binary");
		header('Expires: '.gmdate('D, d M Y H:i:s').' GMT');
		header('Content-Disposition: attachment; filename = "'.$title.' '.date("Y-m-d-H-i-s").'.'.$ttt.'"');
		header('Pragma: no-cache'); 
		echo chr(255).chr(254).iconv("UTF-8", "UTF-16LE//IGNORE", $rd);  
	}else{
		header('Content-Type: text/html; charset=utf-8');
		echo '<style type="text/css"> body{ padding:0px; margin:0px; } #footer td{ background-color:#fff;} </style>';
		echo $rd;
	}
}; //Function

function check_line($asset_name, $c_brand, $c_serial, $c_model, $fix_len)
{
	$arr_row = array();
	$arr_row[] = ceil((mb_strlen($asset_name, 'utf-8')/$fix_len));
	$arr_row[] = ceil((mb_strlen($c_brand, 'utf-8')/$fix_len));
	$arr_row[] = ceil((mb_strlen($c_serial, 'utf-8')/$fix_len));
	$arr_row[] = ceil((mb_strlen($c_model, 'utf-8')/$fix_len));
	
	$row = max($arr_row);

	$data["row"] = $row;
	for ($i = 1; $i <= $row; $i++)
	{
		$data["data"][$i]["asset_name"] = iconv_substr($asset_name, (($i-1)*($fix_len)), $fix_len, 'utf-8');
		$data["data"][$i]["c_brand"] = iconv_substr($c_brand, (($i-1)*($fix_len)), $fix_len, 'utf-8');
		$data["data"][$i]["c_serial"] = iconv_substr($c_serial, (($i-1)*($fix_len)), $fix_len, 'utf-8');
		$data["data"][$i]["c_model"] = iconv_substr($c_model, (($i-1)*($fix_len)), $fix_len, 'utf-8');
	}
	return $data;
}#end function check_line
 
###################
$db 	= new DatabaseServer();
$date 	= new i_date();
########################################################################## 
//print_r($_REQUEST);exit;
//iSearch
$asset_group = $_REQUEST["asset_group"];
$asset_type = $_REQUEST["asset_type"];
$cost_code1 = $_REQUEST["cost_code1"];
$cost_code2 = $_REQUEST["cost_code2"];
$i_start_month = sprintf("%02d",$_REQUEST["i_start_month"]);
$i_end_month = sprintf("%02d",$_REQUEST["i_end_month"]);
$i_start_year = $_REQUEST["i_start_year"];

//style
$css_gl_hdr = "font-size: 14px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000; font-weight:bold;";
$css_gl_top_bottom_left = "border-bottom: 2px solid Black; border-bottom-width: 1px; border-top: 2px solid Black; border-top-width: 1px; border-left: 2px solid Black; border-left-width: 1px; FONT-SIZE: 12px;  COLOR: #00000;  FONT-FAMILY: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; font-weight:bold;";
$css_gl_top_bottom_all = "border-bottom: 2px solid Black; border-bottom-width: 1px; border-top: 2px solid Black; border-top-width: 1px; border-left: 2px solid Black; border-left-width: 1px; border-right: 2px solid Black; border-right-width: 1px; FONT-SIZE: 12px;  COLOR: #00000;  FONT-FAMILY: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; font-weight:bold;";
$css_am_text = "border-left: 1px solid Black; font-size: 10px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000;";
$css_am_text_close = "border-left: 1px solid Black; border-right: 1px solid Black; font-size: 10px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000;";
$css_gl_information	= "font-size: 10px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000; font-weight:bold;";
$css_am_text_comment = "border-bottom: 1px solid Black; border-left: 1px solid Black; font-size: 10px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000; font-weight:bold;";
$css_am_text_comment_close = "border-bottom: 1px solid Black; border-left: 1px solid Black; border-right: 1px solid Black; font-size: 10px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000; font-weight:bold;";
//===========================================
$reportColumn = 12;
$dataAssetGroup = ($asset_group != "")? $db->GetDataBySQL("select c_code, c_name, asset_type from dc_asset_type where c_code = ?", array($asset_group)) : array("c_code"=>"", "c_name"=>"เลือกทั้งหมด","asset_type"=>1);

$titleCost = "เลือกทั้งหมด ถึง เลือกทั้งหมด";
if ($cost_code1 != "" && $cost_code2 != ""){
    $cost1 = $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where c_code = ?", array($cost_code1));
    $cost2 = $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where c_code = ?", array($cost_code2));
    $titleCost = "[{$cost1}] ถึง [{$cost2}]";
}else if ($cost_code1 != ""){
    $cost1 = $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where c_code = ?", array($cost_code1));
    $titleCost = "[{$cost1}]";
}else if ($cost_code2 != ""){
    $cost2 = $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where c_code = ?", array($cost_code2));
    $titleCost = "[{$cost2}]";
}

$last_day = date("t", mktime(0, 0, 0, $i_end_month, 1, $i_start_year));
$depreAt = $last_day." ".$date->l_month_thai[$i_end_month]." ".($i_start_year+543);

//หัวรายงาน = ชื่อรายงาน+หน้า
$tb_w = "100%"; 

$data_hdr["0"]	= "<table width=\"$tb_w\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" bgcolor=\"FFFFFF\" style=\"page-break-after: always;\">";

$data_hdr["1"]	= "<tr><td colspan=".($reportColumn-3)." align=left style=\"{$css_gl_hdr}\">บริษัท อสมท จำกัด (มหาชน)</td>";

$data_hdr["2"]	= "";

$data_hdr["3"]	= "<tr><td colspan=".$reportColumn." align=left style=\"{$css_gl_hdr}\">ทะเบียนสินทรัพย์ : {$dataAssetGroup["c_code"]} {$dataAssetGroup["c_name"]}</td></tr>"
                ."<tr>"
                    . "<td colspan=".($reportColumn-3)." align=left style=\"{$css_gl_hdr}\">หน่วยงาน :&nbsp;{$titleCost} ณ วันที่ {$depreAt}</td>"
                    . "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">วันที่ ".$date->shot_date_from_db(date('Y-m-d'))." เวลา ".date('H:i')."</td>"
                . "</tr>"
               ;

if ($dataAssetGroup["asset_type"] == "0") // ที่ดิน
{
	$strHead = "<th width=10% style=\"{$css_gl_top_bottom_left}\" nowrap>จำนวนเนื้อที่</th>"
				."<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>เลขที่โฉนด</th>"
				."<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>เลขที่ นส.3ก</th>";
}
else // สินทรัพย์
{
	$strHead = "<th width=10% style=\"{$css_gl_top_bottom_left}\" nowrap>ยี่ห้อ</th>"
				."<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>Serial NO</th>"
				."<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>แบบ</th>";
}

$data_hdr["4"]	= "<tr bgcolor=#A5BAD6>"
				."		<th width=10% style=\"{$css_gl_top_bottom_left}\" nowrap>รหัส</th>"
				."		<th width=10% style=\"{$css_gl_top_bottom_left}\" nowrap>ชื่อสินทรัพย์</th>"
						.$strHead
				."		<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>วันที่<br />ได้มา</th>"
                                ."		<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>วันที่<br />คิดค่าเสื่อม</th>"
				."		<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>ราคาทุน<br />(บาท)</th>"
                                ."              <th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>ค่าเสื่อมสะสม <br />ยกมา 1 ".$date->s_month_thai[$i_start_month]." ".($i_start_year+543)."</th>"
				."		<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>ค่าเสื่อมราคา<br />(บาท)</th>"
				."		<th width=8% style=\"{$css_gl_top_bottom_left}\" nowrap>รวม <br />{$depreAt}</th>"
                                ."		<th width=8% style=\"{$css_gl_top_bottom_left}\" nowrap>ราคาตามบัญชี<br />(บาท)</th>"
				."	</tr>";

$strCloseTable = "<tr>"
                    ."<td align=right colspan={$reportColumn} style=\"{$css_am_text_comment_close}\">&nbsp;</td>"
                    ."</tr>"
                    ."</table>";
$line_page          = 54; //จำนวนบรรทัดต่อ 1 หน้า	
$fix_len_half_min   = 50; //จำนวนตัวหนังสือที่จะขึ้นบรรทัดใหม่  MINIMUM [dc_acc_id,dc_product_id,dc_cost_acc_id]

$i = 0; // หน้าที่
$cal_line = 0; // นับจำนวนแถวทั้งหมด
$data = "";
$row_count = 0; // นับจำนวนแถวต่อหน้า

$all_page = "MYPAGE";
$i_row = 0; // รายการ
//===========================================
$ym_start = sprintf("%04d%02d", $i_start_year, $i_start_month);
$ym_end = sprintf("%04d%02d", $i_start_year,$i_end_month);
$lastDate = $i_start_year."-".$i_end_month."-".$last_day;
$inv_code = ($asset_type != '')? $asset_type : $asset_group;

$sqlAcc = "select isnull(sum(b.f_dr),0) as dr
            from gl_tran_hdr a inner join gl_tran_dtl b on a.gl_tran_hdr_id = b.gl_tran_hdr_id
            where left(a.c_code , 1) = 'G'
                and left(a.c_ref_doc, 2) = 'JV'
                and isnull(a.i_is_close_year,2) = 2                
                and a.i_enable = ?
                and cast(year(a.d_save_date)as varchar(4))+right('0'+cast(month(a.d_save_date) as varchar(2)),2) between ? and ?
                and b.dc_acc_id in (select distinct dc_acc_cr_id from dc_asset_type where len(c_code) = 4 and isnull(dc_acc_cr_id, 0)> 0 and c_code like ?)
                and b.dc_cost_acc_id in (select dc_cost_id from dc_cost where c_code between ? and ?)";
$sumAcc = $db->GetDataBySQL($sqlAcc, array(STATUS_ENABLE, $ym_start, $ym_end, "{$inv_code}%", $cost_code1, $cost_code2));

$arrParam[] = $ym_start;
$arrParam[] = $ym_end;
$arrParam[] = $lastDate;
$arrParam[] = $cost_code1;
$arrParam[] = $cost_code2;
$arrParam[] = $inv_code;

$mk = mktime(date("H"), date("i"), date("s"));
$tempDepre = "##temp_depre".$mk;
		
$sql = "SET NOCOUNT ON;  
        declare @c_yyyy_mm1 as varchar(6);
        declare @c_yyyy_mm2 as varchar(6);
        declare @last_day as varchar(10);
        declare @cost1 as varchar(20);
        declare @cost2 as varchar(20);
        declare @asset_type as varchar(20);

        set @c_yyyy_mm1 = ?;
        set @c_yyyy_mm2 = ?;
        set @last_day = ?;
        set @cost1 = ?;
        set @cost2 = ?;
        set @asset_type = ?;

        select 
                a.dc_cost_id
                , b.c_code as cost_code
                , b.c_name as cost_name
                , a.dc_asset_id
                , a.c_code as asset_code
                , cast('-' as varchar(2000)) as asset_name
                , cast('-' as varchar(2000)) as c_brand
                , cast('-' as varchar(2000)) as c_serial
                , cast('-' as varchar(2000)) as c_model
                , cast('-' as varchar(2000)) as p_area
                , cast('-' as varchar(2000)) as p_deed
                , cast('-' as varchar(2000)) as p_num_area
                , cast(0.00 as decimal(18, 2)) as c_cost_asset
                , cast(min(f_depreciate_af) as decimal(18, 2)) as f_depre_bal
                , cast(sum(f_depre) as decimal(18, 2)) as f_depre
                , cast((min(f_depreciate_af)+sum(f_depre)) as decimal(18, 2)) as f_sum_depre
                , cast(0.00 as decimal(18, 2)) as f_acc_price
                , cast(null as datetime) as d_receive_date
                , cast(null as datetime) as d_depreciate
                , cast(1 as tinyint) as i_type
        into {$tempDepre}
        from gl_asset_depre a
                inner join dc_cost b on a.dc_cost_id = b.dc_cost_id
        where c_yyyy_mm between @c_yyyy_mm1 and @c_yyyy_mm2
                and b.c_code between @cost1 and @cost2
                and a.c_code like @asset_type+'%' 
                and gl_depre_hdr_id in (select gl_depre_hdr_id from gl_depre_hdr where i_enable = 1 and ref_c_code like @asset_type+'%')
                and a.dc_asset_id in (select dc_asset_id from dc_asset where a.c_code like @asset_type+'%')
        group by a.dc_cost_id, b.c_code, b.c_name, a.dc_asset_id , a.c_code;

        update a
        set a.asset_name = isnull(c.c_name, '-')
            , a.c_brand = isnull(c.c_brand, '-')
            , a.c_serial = isnull(c.c_serial, '-')
            , a.c_model = isnull(c.c_model, '-')
            , a.p_area = isnull(c.p_area, '-')
            , a.p_deed = isnull(c.p_deed, '-')
            , a.p_num_area = isnull(c.p_num_area, '-')
            , a.c_cost_asset = c.c_cost_asset
            , a.d_receive_date = c.d_receive_date
            , a.d_depreciate = c.d_depreciate
            , a.f_acc_price = c.c_cost_asset - a.f_sum_depre
        from {$tempDepre} a, dc_asset b, am_tran_rg_dtl c
        where a.dc_asset_id = b.dc_asset_id and b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id;


        insert into {$tempDepre}
        select case when convert(datetime, b.ta_date, 102) <= convert(datetime, @last_day, 102)
                        then isnull(b.dc_cost_id_ta, b.dc_cost_id) else b.dc_cost_id end dc_cost_id
                , cast('-' as varchar(2000)) as cost_code
                , cast('-' as varchar(2000)) as cost_name
                , b.dc_asset_id 
                , b.c_code as asset_code
                , isnull(a.c_name, '-') as asset_name
                , isnull(a.c_brand, '-') as c_brand
                , a.c_serial as c_serial
                , a.c_model as c_model
                , a.p_area
                , a.p_deed
                , a.p_num_area
                , cast(c_cost_asset as decimal(18, 2)) as c_cost_asset
                , isnull((select max(f_salv) from gl_asset_depre 
                                        where dc_asset_id = b.dc_asset_id
                                                and gl_depre_hdr_id = (select top 1 aa.gl_depre_hdr_id from gl_asset_depre aa 
                                                                inner join gl_depre_hdr bb on aa.gl_depre_hdr_id = bb.gl_depre_hdr_id 
                                                                where dc_asset_id = b.dc_asset_id and bb.c_yyyy_mm < @c_yyyy_mm1
                                                                order by bb.c_yyyy_mm desc, aa.gl_asset_depre_id desc)), cast(f_depreciate as decimal(18, 2))) as f_depre_bal 
                , cast(0.00 as decimal(18, 2)) as f_depre
                , isnull((select max(f_salv) from gl_asset_depre 
                                                where dc_asset_id = b.dc_asset_id
                                                        and gl_depre_hdr_id = (select top 1 aa.gl_depre_hdr_id from gl_asset_depre aa 
                                                                        inner join gl_depre_hdr bb on aa.gl_depre_hdr_id = bb.gl_depre_hdr_id 
                                                                        where dc_asset_id = b.dc_asset_id and bb.c_yyyy_mm < @c_yyyy_mm1
                                                                        order by bb.c_yyyy_mm desc, aa.gl_asset_depre_id desc)), cast(f_depreciate as decimal(18, 2))) as f_sum_depre
                ,cast((c_cost_asset-(isnull((select max(f_salv) from gl_asset_depre 
                                                where dc_asset_id = b.dc_asset_id
                                                and gl_depre_hdr_id = (select top 1 aa.gl_depre_hdr_id from gl_asset_depre aa 
                                                                inner join gl_depre_hdr bb on aa.gl_depre_hdr_id = bb.gl_depre_hdr_id 
                                                                where dc_asset_id = b.dc_asset_id and bb.c_yyyy_mm < @c_yyyy_mm1
                                                                order by bb.c_yyyy_mm desc, aa.gl_asset_depre_id desc)), cast(isnull(f_depreciate,0) as decimal(18, 2))))) as decimal(18, 2)) as f_acc_price
                , a.d_receive_date as d_receive_date
                , a.d_depreciate as d_depreciate
                , cast(1 as tinyint) as i_type
        from am_tran_rg_dtl a
                inner join dc_asset b on a.am_tran_rg_dtl_id = b.am_tran_rg_dtl_id
        where a.i_is_audit = 1		
                and a.c_code like @asset_type+'%' 
                and a.am_tran_rg_hdr_id in (select am_tran_rg_hdr_id from am_tran_rg_hdr 
                                            where cast(year(d_doc_date) as varchar)+ right('0'+cast(month(d_doc_date) as varchar), 2) <= @c_yyyy_mm2)
                and dc_asset_id not in (select dc_asset_id from {$tempDepre})
                and dc_asset_id not in (select b.dc_asset_id from am_tf_hdr a
                                            inner join am_tf_dtl b on a.am_tf_hdr_id = b.am_tf_hdr_id
                                    where a.c_code_gen not like 'TA%' 
                                            and a.c_code_gen <> 'BT'
                                            and(cast(year(d_doc_date) as varchar)+ right('0'+cast(month(d_doc_date) as varchar), 2) 
                                                    < @c_yyyy_mm1))
                ;

        insert into {$tempDepre}
        select a.dc_cost_id
                , c.cost_code
                , c.cost_name
                , b.dc_asset_id 
                , c.asset_code
                , c.asset_name
                , c.c_brand
                , c.c_serial
                , c.c_model
                , c.p_area
                , c.p_deed
                , c.p_num_area
                , c.c_cost_asset/-1
                , c.f_depre_bal/-1
                , c.f_depre/-1
                , c.f_sum_depre/-1
                , c.f_acc_price/-1
                , c.d_receive_date
                , c.d_depreciate
                , 2
        from am_tf_hdr a
                inner join am_tf_dtl b on a.am_tf_hdr_id = b.am_tf_hdr_id
                inner join {$tempDepre} c on a.dc_cost_id = c.dc_cost_id and b.dc_asset_id = c.dc_asset_id
        where a.c_code_gen <> 'BT' and a.c_code_gen <> 'TA'
                and(cast(year(isnull(d_date_chg, d_doc_date)) as varchar)+ right('0'+cast(month(isnull(d_date_chg, d_doc_date)) as varchar), 2) between @c_yyyy_mm1 and @c_yyyy_mm2);

        update a
        set  cost_code = (select c_code from dc_cost where dc_cost_id = a.dc_cost_id)
                , cost_name = (select c_name from dc_cost where dc_cost_id = a.dc_cost_id)
        from {$tempDepre} a
        where cost_code = '-' and cost_name = '-';

        delete from {$tempDepre} where cost_code not between @cost1 and @cost2;

        select dc_cost_id
            , cost_code
            , cost_name
            , dc_asset_id
            , asset_code
            , asset_name
            , c_brand
            , c_serial
            , c_model
            , p_area
            , p_deed
            , p_num_area
            , isnull(c_cost_asset, 0) as c_cost_asset
            , isnull(f_depre_bal, 0) as f_depre_bal
            , isnull(f_depre, 0) as f_depre
            , isnull(f_sum_depre, 0) as f_sum_depre
            , isnull(f_acc_price, 0) as f_acc_price
            , isnull(convert(varchar(10), d_receive_date, 120),'') as d_receive_date
            , isnull(convert(varchar(10), d_depreciate, 120),'') as d_depreciate
            , i_type
        from {$tempDepre}
        order by cost_code, d_receive_date, asset_code, i_type;

        drop table {$tempDepre};";
/*echo $sqlWhere;		
print_r($arrParam);*/
$stmt = $db->QueryParam($sql, $arrParam);
//========================================================================================================================
$sum_cost1 = array("c_cost_asset"=> 0, "f_depre_bal"=>0, "f_depre"=>0, "f_sum_depre"=>0, "f_acc_price"=>0);
$sum_cost2 = array("c_cost_asset"=> 0, "f_depre_bal"=>0, "f_depre"=>0, "f_sum_depre"=>0, "f_acc_price"=>0);
$sum_cost = array("c_cost_asset"=> 0, "f_depre_bal"=>0, "f_depre"=>0, "f_sum_depre"=>0, "f_acc_price"=>0);
$sum_all = array("c_cost_asset"=> 0, "f_depre_bal"=>0, "f_depre"=>0, "f_sum_depre"=>0, "f_acc_price"=>0);
$sum_all1 = array("c_cost_asset"=> 0, "f_depre_bal"=>0, "f_depre"=>0, "f_sum_depre"=>0, "f_acc_price"=>0);
$sum_all2 = array("c_cost_asset"=> 0, "f_depre_bal"=>0, "f_depre"=>0, "f_sum_depre"=>0, "f_acc_price"=>0);
$cost_id = 0;
$cost_code = "";
$cost_name = "";
while ($row = $db->Fetch($stmt))
{
	$i_row++;
                        
	if ($cal_line==0 || $row_count>=$line_page)  #ตัดหัวกระดาษ ขึ้นหน้าใหม่
	{
		$i++;
		$data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";

		if ($cal_line > 0)
			$data .= $strCloseTable;
		$data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
		$row_count=0;
	}

        if ($cost_id != $row["dc_cost_id"]) // เปลี่ยนหน่วยงานใหม่
        {
            if ($cost_id > 0)
            {
                $data.="<tr bgcolor='#C6D2D1'>"
                        ."<th align=right style=\"{$css_am_text_comment}\" colspan=\"7\">รวมหน่วยงาน ".$cost_code." ".$cost_name." ก่อนหักตัดจำหน่าย</th>"
                        ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost1["c_cost_asset"],2)."</th>"
                        ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost1["f_depre_bal"],2)."</th>"
                        ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost1["f_depre"],2)."</th>"
                        ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost1["f_sum_depre"],2)."</th>"
                        ."<th align=right style=\"{$css_am_text_comment_close}\">".number_format($sum_cost1["f_acc_price"],2)."</th>"
                        ."</tr>";
                $sum_cost1 = array("c_cost_asset"=> 0, "f_depre_bal"=>0, "f_depre"=>0, "f_sum_depre"=>0, "f_acc_price"=>0);
                $cal_line++;
                $row_count++;

                if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
                { 
                    $i++; 
                    $data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";
                    $data .= $strCloseTable;
                    $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
                    $row_count=0;
                }
//=====
                $data.="<tr bgcolor='#C6D2D1'>"
                            ."<th align=right style=\"{$css_am_text_comment}\" colspan=\"7\">รวมตัดจำหน่ายหน่วยงาน ".$cost_code." ".$cost_name."</th>"
                            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost2["c_cost_asset"],2)."</th>"
                            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost2["f_depre_bal"],2)."</th>"
                            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost2["f_depre"],2)."</th>"
                            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost2["f_sum_depre"],2)."</th>"
                            ."<th align=right style=\"{$css_am_text_comment_close}\">".number_format($sum_cost2["f_acc_price"],2)."</th>"
                        . "</tr>";
                $sum_cost2 = array("c_cost_asset"=> 0, "f_depre_bal"=>0, "f_depre"=>0, "f_sum_depre"=>0, "f_acc_price"=>0);
                $cal_line++;
                $row_count++;

                if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
                { 
                    $i++; 
                    $data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";
                    $data .= $strCloseTable;
                    $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
                    $row_count=0;
                }
//=====
                $data.="<tr bgcolor='#C6D2D1'>"
                            ."<th align=right style=\"{$css_am_text_comment}\" colspan=\"7\">รวมหน่วยงาน ".$cost_code." ".$cost_name."</th>"
                            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost["c_cost_asset"],2)."</th>"
                            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost["f_depre_bal"],2)."</th>"
                            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost["f_depre"],2)."</th>"
                            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost["f_sum_depre"],2)."</th>"
                            ."<th align=right style=\"{$css_am_text_comment_close}\">".number_format($sum_cost["f_acc_price"],2)."</th>"
                        ."</tr>";
                $sum_cost = array("c_cost_asset"=> 0, "f_depre_bal"=>0, "f_depre"=>0, "f_sum_depre"=>0, "f_acc_price"=>0);
                $cal_line++;
                $row_count++;

                if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
                { 
                    $i++; 
                    $data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";
                    $data .= $strCloseTable;
                    $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
                    $row_count=0;
                }
            }

            $data.="<tr bgcolor='#C6D2D1'><th align=\"left\" style=\"{$css_am_text_close}\" colspan={$reportColumn}><u>".$row["cost_code"]." ".$row["cost_name"]."</u></th></tr>";
            $cal_line++;
            $row_count++;

            if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
            { 
                $i++; 
                $data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";
                $data .= $strCloseTable;
                $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
                $row_count=0;
            }

            $cost_id = $row["dc_cost_id"];
            $cost_code = $row["cost_code"];
            $cost_name = $row["cost_name"];
        }

        if ($row["i_type"] == 1) // ทั่วไป
        {
            if ($dataAssetGroup["asset_type"] == "0") // ที่ดิน
            {
                $arr_data = check_line($row["asset_name"], $row["p_area"], $row["p_deed"], $row["p_num_area"], $fix_len_half_min);
            }
            else // สินทรัพย์
            {
                $arr_data = check_line($row["asset_name"], $row["c_brand"], $row["c_serial"], $row["c_model"], $fix_len_half_min);
            }

            $asset_name = ($arr_data["data"][1]["asset_name"] != "")? $arr_data["data"][1]["asset_name"] : "&nbsp;";

            if ($dataAssetGroup["asset_type"] == "0") // ที่ดิน
            {
                $p_area = ($arr_data["data"][1]["c_brand"] != "")? $arr_data["data"][1]["c_brand"] : "&nbsp;";
                $p_deed = ($arr_data["data"][1]["c_serial"] != "")? $arr_data["data"][1]["c_serial"] : "&nbsp;";
                $p_num_area = ($arr_data["data"][1]["c_model"] != "")? $arr_data["data"][1]["c_model"] : "&nbsp;";

                $strDetail = "<td align=left style=\"{$css_am_text}\" nowrap valign=top title=จำนวนเนื้อที่>".$p_area."</td>"
                            ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=เลขที่โฉนด>".$p_deed."</td>"
                            ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=เลขที่ นส.3ก>".$p_num_area."</td>";

                $row["f_acc_price"] = $row["c_cost_asset"];
            }
            else // สินทรัพย์
            {
                $c_brand = ($arr_data["data"][1]["c_brand"] != "")? $arr_data["data"][1]["c_brand"] : "&nbsp;";
                $c_serial = ($arr_data["data"][1]["c_serial"] != "")? $arr_data["data"][1]["c_serial"] : "&nbsp;";
                $c_model = ($arr_data["data"][1]["c_model"] != "")? $arr_data["data"][1]["c_model"] : "&nbsp;";

                $strDetail = "<td align=left style=\"{$css_am_text}\" nowrap valign=top title=ยี่ห้อ>".$c_brand."</td>"
                            ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=Serial>".$c_serial."</td>"
                            ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=แบบ>".$c_model."</td>";
            }

            $d_receive_date = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : '';
            $d_depreciate = ($row["d_depreciate"] != "")? $date->shot_date_from_db($row["d_depreciate"]) : '';
            $data.="<tr>"
                        ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=รหัส>".$row["asset_code"]."</td>"
                        ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=ชื่อสินทรัพย์>".$asset_name."</td>"
                        .$strDetail
                        ."<td align=center style=\"{$css_am_text}\" nowrap valign=top title=วันที่ได้มา>{$d_receive_date}&nbsp;</td>"
                        ."<td align=center style=\"{$css_am_text}\" nowrap valign=top title=วันที่คิดค่าเสื่อม>{$d_depreciate}&nbsp;</td>"
                        ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=ราคาทุน>".number_format($row["c_cost_asset"],2)."</td>"
                        ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=ค่าเสื่อมยกมา>".number_format($row["f_depre_bal"],2)."</td>"
                        ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=ค่าเสื่อม>".number_format($row["f_depre"],2)."</td>"
                        ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=รวม>".number_format($row["f_sum_depre"],2)."</td>"
                        ."<td align=right style=\"{$css_am_text_close}\" nowrap valign=top title=ราคาตามบัญชี>".number_format($row["f_acc_price"],2)."</td>"
                    ."</tr>"
                    ;
            $cal_line++;
            $row_count++;

            if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
            { 
                $i++; 
                $data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";
                $data .= $strCloseTable;
                $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
                $row_count=0;
            }

            if ($arr_data["row"] > 1)
            {
                for ($ii=2; $ii <= $arr_data["row"]; $ii++)
                {
                    $asset_name = ($arr_data["data"][$ii]["asset_name"] != "")? $arr_data["data"][$ii]["asset_name"] : "&nbsp;";
                    $c_brand = ($arr_data["data"][$ii]["c_brand"] != "")? $arr_data["data"][$ii]["c_brand"] : "&nbsp;";
                    $c_serial = ($arr_data["data"][$ii]["c_serial"] != "")? $arr_data["data"][$ii]["c_serial"] : "&nbsp;";
                    $c_model = ($arr_data["data"][$ii]["c_model"] != "")? $arr_data["data"][$ii]["c_model"] : "&nbsp;";
                    $data.="<tr>"
                                ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=รหัส>&nbsp;</td>"
                                ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=ชื่อสินทรัพย์>".$asset_name."</td>"
                                ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=ยี่ห้อ>".$c_brand."</td>"
                                ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=Serial>".$c_serial."</td>"
                                ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=แบบ>".$c_model."</td>"
                                ."<td align=center style=\"{$css_am_text}\" nowrap valign=top title=วันที่ได้มา>&nbsp;</td>"
                                ."<td align=center style=\"{$css_am_text}\" nowrap valign=top title=วันที่คิดค่าเสื่อม>&nbsp;</td>"
                                ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=ราคาทุน>&nbsp;</td>"
                                ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=ค่าเสื่อมยกมา>&nbsp;</td>"
                                ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=ค่าเสื่อม>&nbsp;</td>"
                                ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=รวม>&nbsp;</td>"
                                ."<td align=right style=\"{$css_am_text_close}\" nowrap valign=top title=ราคาตามบัญชี>&nbsp;</td>"
                            ."</tr>"
                                ;
                    $cal_line++;
                    $row_count++;

                    if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
                    { 
                        $i++; 
                        $data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";
                        $data .= $strCloseTable;
                        $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
                        $row_count=0;
                    }
                }
            }

            //เงินรวมค่าเสื่อมทั่วไป
            $sum_cost1["c_cost_asset"]  += round($row["c_cost_asset"],2);
            $sum_cost1["f_depre_bal"]	+= round($row["f_depre_bal"],2);
            $sum_cost1["f_depre"]	+= round($row["f_depre"],2);
            $sum_cost1["f_sum_depre"]	+= round($row["f_sum_depre"],2);
            $sum_cost1["f_acc_price"]	+= round($row["f_acc_price"],2);

            //เงินรวมค่าเสื่อมทั่วไปทั้งหมด
            $sum_all1["c_cost_asset"]   += round($row["c_cost_asset"],2);
            $sum_all1["f_depre_bal"]	+= round($row["f_depre_bal"],2);
            $sum_all1["f_depre"]	+= round($row["f_depre"],2);
            $sum_all1["f_sum_depre"]	+= round($row["f_sum_depre"],2);
            $sum_all1["f_acc_price"]	+= round($row["f_acc_price"],2);
        }
        else // กรณีโอนย้าย หรือ ตัดจำหน่าย
        {
                if ($dataAssetGroup["asset_type"] == "0") // ที่ดิน
                {
                    $row["f_acc_price"] = $row["c_cost_asset"];
                }

                $data.="<tr>"
                            ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=รหัส>&nbsp;</td>"
                            ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=ชื่อสินทรัพย์>&nbsp;</td>"
                            ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=ยี่ห้อ>&nbsp;</td>"
                            ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=Serial>&nbsp;</td>"
                            ."<td align=left style=\"{$css_am_text}\" nowrap valign=top title=แบบ>&nbsp;</td>"
                            ."<td align=center style=\"{$css_am_text}\" nowrap valign=top title=วันที่ได้มา>&nbsp;</td>"
                            ."<td align=center style=\"{$css_am_text}\" nowrap valign=top title=วันที่คิดค่าเสื่อม>&nbsp;</td>"
                            ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=ราคาทุน>".number_format($row["c_cost_asset"],2)."</td>"
                            ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=ค่าเสื่อมยกมา>".number_format($row["f_depre_bal"],2)."</td>"
                            ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=ค่าเสื่อม>".number_format($row["f_depre"],2)."</td>"
                            ."<td align=right style=\"{$css_am_text}\" nowrap valign=top title=รวม>".number_format($row["f_sum_depre"],2)."</td>"
                            ."<td align=right style=\"{$css_am_text_close}\" nowrap valign=top title=ราคาตามบัญชี>".number_format($row["f_acc_price"],2)."</td>"
                        . "</tr>"
                            ;
                $cal_line++;
                $row_count++;

                if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
                { 
                        $i++; 
                        $data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";
                        $data .= $strCloseTable;
                        $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
                        $row_count=0;
                }

                //เงินรวมโอนย้ายตัดจำหน่าย
                $sum_cost2["c_cost_asset"]  += round($row["c_cost_asset"],2);
                $sum_cost2["f_depre_bal"]   += round($row["f_depre_bal"],2);
                $sum_cost2["f_depre"]       += round($row["f_depre"],2);
                $sum_cost2["f_sum_depre"]   += round($row["f_sum_depre"],2);
                $sum_cost2["f_acc_price"]   += round($row["f_acc_price"],2);

                //เงินรวมโอนย้ายตัดจำหน่ายทั้งหมด
                $sum_all2["c_cost_asset"]   += round($row["c_cost_asset"],2);
                $sum_all2["f_depre_bal"]    += round($row["f_depre_bal"],2);
                $sum_all2["f_depre"]        += round($row["f_depre"],2);
                $sum_all2["f_sum_depre"]    += round($row["f_sum_depre"],2);
                $sum_all2["f_acc_price"]    += round($row["f_acc_price"],2);
        }

        $sum_cost["c_cost_asset"]  += round($row["c_cost_asset"],2);
        $sum_cost["f_depre_bal"]   += round($row["f_depre_bal"],2);
        $sum_cost["f_depre"]       += round($row["f_depre"],2);
        $sum_cost["f_sum_depre"]   += round($row["f_sum_depre"],2);
        $sum_cost["f_acc_price"]   += round($row["f_acc_price"],2);

        $sum_all["c_cost_asset"]   += round($row["c_cost_asset"],2);
        $sum_all["f_depre_bal"]    += round($row["f_depre_bal"],2);
        $sum_all["f_depre"]        += round($row["f_depre"],2);
        $sum_all["f_sum_depre"]    += round($row["f_sum_depre"],2);
        $sum_all["f_acc_price"]    += round($row["f_acc_price"],2);
}// end while
///====================================================================================
$data.="<tr bgcolor='#C6D2D1'>"
            ."<th align=right style=\"{$css_am_text_comment}\" colspan=\"7\">รวมหน่วยงาน ".$cost_code." ".$cost_name." ก่อนหักตัดจำหน่าย</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost1["c_cost_asset"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost1["f_depre_bal"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost1["f_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost1["f_sum_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment_close}\">".number_format($sum_cost1["f_acc_price"],2)."</th>"
        ."</tr>";

$cal_line++;
$row_count++;

if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
{ 
        $i++; 
        $data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";
        $data .= $strCloseTable;
        $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
        $row_count=0;
}
//=====
$data.="<tr bgcolor='#C6D2D1'>"
            ."<th align=right style=\"{$css_am_text_comment}\" colspan=\"7\">รวมตัดจำหน่ายหน่วยงาน ".$cost_code." ".$cost_name."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost2["c_cost_asset"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost2["f_depre_bal"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost2["f_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost2["f_sum_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment_close}\">".number_format($sum_cost2["f_acc_price"],2)."</th>"
        ."</tr>";
$cal_line++;
$row_count++;

if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
{ 
        $i++; 
        $data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";
        $data .= $strCloseTable;
        $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
        $row_count=0;
}
//=====

$data.="<tr bgcolor='#C6D2D1'>"
            ."<th align=right style=\"{$css_am_text_comment}\" colspan=\"7\">รวมหน่วยงาน ".$cost_code." ".$cost_name."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost["c_cost_asset"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost["f_depre_bal"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost["f_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_cost["f_sum_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment_close}\">".number_format($sum_cost["f_acc_price"],2)."</th>"
        ."</tr>";
$cal_line++;
$row_count++;

if ($sumAcc <> 0)
{
    $data.="<tr bgcolor='#C6D2D1'>"
                ."<th align=right style=\"{$css_am_text_comment}\" colspan=\"7\">ยอดเงินจากการบันทึกสมุดรายวัน</th>"
                ."<th align=right style=\"{$css_am_text_comment}\">&nbsp;</th>"
                ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sumAcc,2)."</th>"
                ."<th align=right style=\"{$css_am_text_comment}\">&nbsp;</th>"
                ."<th align=right style=\"{$css_am_text_comment}\">&nbsp;</th>"
                ."<th align=right style=\"{$css_am_text_comment_close}\">&nbsp;</th>"
            ."</tr>";
    $cal_line++;
    $row_count++;

    $sum_all["c_cost_asset"]    = $sum_all["c_cost_asset"];
    $sum_all["f_depre_bal"]     = $sum_all["f_depre_bal"]-$sumAcc;
    $sum_all["f_depre"]		= $sum_all["f_depre"]+$sumAcc;
    $sum_all["f_acc_price"]     = $sum_all["f_acc_price"];
}

$data.="<tr bgcolor='#C6D2D1'>"
            ."<th align=right style=\"{$css_am_text_comment}\" colspan=\"7\">รวมทั้งหมดก่อนหักตัดจำหน่าย </th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all1["c_cost_asset"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all1["f_depre_bal"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all1["f_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all1["f_sum_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment_close}\">".number_format($sum_all1["f_acc_price"],2)."</th>"
        ."</tr>";
$data.="<tr bgcolor='#C6D2D1'>"
            ."<th align=right style=\"{$css_am_text_comment}\" colspan=\"7\">รวมตัดจำหน่ายทั้งหมด </th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all2["c_cost_asset"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all2["f_depre_bal"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all2["f_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all2["f_sum_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment_close}\">".number_format($sum_all2["f_acc_price"],2)."</th>"
        . "</tr>";
$data.="<tr bgcolor='#C6D2D1'>"
            ."<th align=right style=\"{$css_am_text_comment}\" colspan=\"7\">รวมทั้งหมด </th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all["c_cost_asset"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all["f_depre_bal"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all["f_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all["f_sum_depre"],2)."</th>"
            ."<th align=right style=\"{$css_am_text_comment_close}\">".number_format($sum_all["f_acc_price"],2)."</th>"
        ."</tr>";	
//========================================================================================================================

$maxpage = $i;
$data .="</table>";
$data = str_replace ("MYPAGE",$maxpage,$data);

//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$data); 			
?>
