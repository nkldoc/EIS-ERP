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
$dc_asset_method_id = $_REQUEST["dc_asset_method_id"];
$i_start_month = sprintf("%02d",$_REQUEST["i_start_month"]);
$i_end_month = sprintf("%02d",$_REQUEST["i_end_month"]);
$i_start_year = $_REQUEST["i_start_year"];
$i_expire = $_REQUEST["i_expire"];
$i_enable = $_REQUEST["i_enable"];

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
$reportColumn = 13;
$dataAssetGroup = $db->GetDataBySQL("select c_code, c_name, asset_type from dc_asset_type where c_code = ?", array($asset_group));

$codeAsset = ($asset_type != "")? $db->GetDataBySQL("select c_code+' '+c_name from dc_asset_type where c_code = ?", array($asset_type)) : "เลือกทั้งหมด";

$titleCost = "เลือกทั้งหมด ถึง เลือกทั้งหมด";
if ($cost_code1 != "" && $cost_code2 != ""){
    $cost1 = $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where c_code = ?", array($cost_code1));
    $cost2 = $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where c_code = ?", array($cost_code2));
    $titleCost = $cost1." ถึง ".$cost2;
}else if ($cost_code1 != ""){
    $cost1 = $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where c_code = ?", array($cost_code1));
    $titleCost = $cost1;
}else if ($cost_code2 != ""){
    $cost2 = $db->GetDataBySQL("select c_code+' '+c_name from dc_cost where c_code = ?", array($cost_code2));
    $titleCost = $cost2;
}

$last_day = date("t", mktime(0, 0, 0, $i_end_month, 1, $i_start_year));
$depreAt = $last_day." ".$date->l_month_thai[$i_end_month]." ".($i_start_year+543);

//หัวรายงาน = ชื่อรายงาน+หน้า
$tb_w = "100%"; 

$data_hdr["0"]	= "<table width=\"$tb_w\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" bgcolor=\"FFFFFF\" style=\"page-break-after: always;\">";

$data_hdr["1"]	= "<tr><td colspan=".($reportColumn-3)." align=left style=\"{$css_gl_hdr}\">ทะเบียนสินทรัพย์ถาวร (ตามหมวดสินทรัพย์)</td>";

$data_hdr["2"]	= "";

$data_hdr["3"]	= "<tr><td colspan=".$reportColumn." align=left style=\"{$css_gl_hdr}\">หมวดสินทรัพย์ : {$dataAssetGroup["c_code"]} {$dataAssetGroup["c_name"]}</td></tr>"
                        ."<tr><td colspan=".$reportColumn." align=left style=\"{$css_gl_hdr}\">ประเภทสินทรัพย์ : {$codeAsset}</td></tr>"
                        ."<tr><td colspan=".$reportColumn." align=left style=\"{$css_gl_hdr}\">หน่วยงาน/ศูนย์ต้นทุน :&nbsp;{$titleCost}</td></tr>"
                        ."<tr><td colspan=".$reportColumn." align=left style=\"{$css_gl_hdr}\">ค่าเสื่อมราคา ณ วันที่ {$depreAt}</td></tr>"
                       ;

if ($dataAssetGroup["asset_type"] == ASSET_TYPE_LAND) // ที่ดิน
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
				."		<th width=5% style=\"{$css_gl_top_bottom_left}\" nowrap>ลำดับ</th>"
				."		<th width=10% style=\"{$css_gl_top_bottom_left}\" nowrap>รหัสสินทรัพย์</th>"
				."		<th width=10% style=\"{$css_gl_top_bottom_left}\" nowrap>ชื่อสินทรัพย์</th>"
				."		<th width=10% style=\"{$css_gl_top_bottom_left}\" nowrap>หมายเลขสินทรัพย์(เก่า)</th>"
						.$strHead
				."		<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>หน่วยงาน</th>"
				."		<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>วันที่ได้มา</th>"
				."		<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>ราคาทุน</th>"
				."		<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>ค่าเสื่อมราคาสะสม</th>"
				."		<th width=8% style=\"{$css_gl_top_bottom_left}\" nowrap>ราคาตามบัญชี</th>"
				."		<th width=8% style=\"{$css_gl_top_bottom_all}\" nowrap>หมายเหตุ</th>"
				."	</tr>";

$line_page				= 40; //จำนวนบรรทัดต่อ 1 หน้า	
$fix_len_half_min		= 50; //จำนวนตัวหนังสือที่จะขึ้นบรรทัดใหม่  MINIMUM [dc_acc_id,dc_product_id,dc_cost_acc_id]

$i = 0; // หน้าที่
$cal_line = 0; // นับจำนวนแถวทั้งหมด
$data = "";
$row_count = 0; // นับจำนวนแถวต่อหน้า

$all_page = "MYPAGE";
$i_row = 0; // รายการ
//===========================================

$ym_start = sprintf("%04d%02d", $i_start_year, $i_start_month);
$ym_end = sprintf("%04d%02d", $i_start_year,$i_end_month);

$arrParam[] = ($asset_type != '')? $asset_type : $asset_group;
$arrParam[] = $ym_start;
$arrParam[] = $ym_end;
$arrParam[] = $i_enable;

$sqlWhere = "";

if ($cost_code1 != "" && $cost_code2 != ""){
    $sqlWhere .= " and d.c_code between ? and ?";
    $arrParam[] = $cost_code1;
    $arrParam[] = $cost_code2;
}else if ($cost_code1 != ""){
    $sqlWhere .= " and d.c_code = ?";
    $arrParam[] = $cost_code1;
}else if ($cost_code2 != ""){
    $sqlWhere .= " and d.c_code = ?";
    $arrParam[] = $cost_code2;
}

if ($dc_asset_method_id > 0)
{
    $sqlWhere .= " and b.dc_asset_method_id ?";
    $arrParam[] = $dc_asset_method_id;
}

if($i_expire == 1){
    $sqlWhere .= "and (isnull(b.c_cost_asset,0) - isnull(b.f_depreciate,0)) <= b.c_cost_ruins";
}elseif($i_expire == 2){
    $sqlWhere .= "and (isnull(b.c_cost_asset,0) - isnull(b.f_depreciate,0)) > b.c_cost_ruins";
}

$mk = mktime(date("H"), date("i"), date("s"));
$temp_name = "##temp_test".$mk;
$temp_gl = "##temp_gl".$mk;
		
$sql = "SET NOCOUNT ON;  
        declare @inv_code as varchar(10);
        declare @c_yyyy_mm1 as varchar(6);
        declare @c_yyyy_mm2 as varchar(6);
        declare @status_tb as tinyint;

        set @inv_code = ?;
        set @c_yyyy_mm1 = ?;
        set @c_yyyy_mm2 = ?;
        set @status_tb = ?;
		
        select c.c_code as asset_code
                , b.c_name as asset_name
                , isnull(b.c_asset_code_old, '-') as asset_code_old
                , isnull(b.c_brand, '-') as c_brand
                , isnull(b.c_serial, '-') as c_serial
                , isnull(b.c_model, '-') as c_model
                , isnull(b.p_area, '-') as p_area
                , isnull(b.p_deed, '-') as p_deed
                , isnull(b.p_num_area, '-') as p_num_area
                , isnull(convert(varchar(10), b.d_receive_date, 120), '') as d_receive_date
                , c.dc_asset_id
                , d.c_code as cost_code
                , d.c_name as cost_name
                , d.dc_cost_id as dc_cost_id
                , isnull(b.c_cost_asset,0.00) as c_cost_asset
                , isnull(b.f_depreciate,0.00) as f_depre
                , cast(0.00 as decimal(18,2)) as f_depre2
                , isnull(b.c_comment,'') as c_comment
                into {$temp_name}
        from am_tran_rg_hdr a
                inner join am_tran_rg_dtl b on a.am_tran_rg_hdr_id = b.am_tran_rg_hdr_id
                inner join dc_asset c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
                inner join dc_cost d on case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end = d.dc_cost_id
        where b.i_is_success = '1'
                and cast(year(a.d_doc_date) as varchar)+ right('0'+cast(month(a.d_doc_date) as varchar), 2) <= @c_yyyy_mm2
                and case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end is not null 
                and case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end !='0' 
                and case when c.bt_date is not null then 2 else 1 end = @status_tb
                {$sqlWhere}
                and c.c_code like @inv_code+'%'

        select a.dc_asset_id, min(a.f_depreciate_af) as f_before , sum(f_depre) as f_depre
        into {$temp_gl}
        from gl_asset_depre a
                inner join gl_depre_hdr b on a.gl_depre_hdr_id = b.gl_depre_hdr_id
        where dc_asset_id = a.dc_asset_id 
                and right(a.c_yyyy_mm, 6) between @c_yyyy_mm1 and @c_yyyy_mm2
                and b.i_enable = 1 and b.ref_c_code is not null
                and a.c_code like @inv_code+'%'
        group by a.dc_asset_id;
		
        update a
        set a.f_depre = b.f_before
                , a.f_depre2 = b.f_depre
        from {$temp_name} a inner join {$temp_gl} b on a.dc_asset_id = b.dc_asset_id;

        update a 
        set f_depre2 = isnull((select top 1 f_salv from gl_asset_depre 
                                where dc_asset_id = a.dc_asset_id
                                        and right(c_yyyy_mm, 6) < @c_yyyy_mm1
                                        and gl_depre_hdr_id in (select gl_depre_hdr_id from gl_depre_hdr where i_enable = 1 and ref_c_code is not null) 
                                        order by c_yyyy_mm desc, gl_depre_hdr_id desc) - f_depre, 0) 
        from {$temp_name} a
        where f_depre2 = 0
                and isnull((select top 1 f_salv from gl_asset_depre 
                            where dc_asset_id = a.dc_asset_id
                                    and right(c_yyyy_mm, 6) < @c_yyyy_mm1
                                    and gl_depre_hdr_id in (select gl_depre_hdr_id from gl_depre_hdr where i_enable = 1 and ref_c_code is not null) 
                                    order by c_yyyy_mm desc, gl_depre_hdr_id desc), 0) > 0;
		
        select asset_code
                , asset_name
                , asset_code_old
                , c_brand
                , c_serial
                , c_model
                , p_deed
                , p_area
                , p_num_area
                , d_receive_date
                , dc_asset_id
                , cost_code
                , cost_name
                , dc_cost_id
                , c_cost_asset
                , (f_depre+f_depre2) as f_depre
                , c_cost_asset-(f_depre+f_depre2) as f_acc_price 
                , c_comment
        from {$temp_name} aa
        order by d_receive_date, asset_code ASC ;
		
        drop table {$temp_name};
        drop table {$temp_gl};";
/*echo $sqlWhere;		
print_r($arrParam);*/
$stmt = $db->QueryParam($sql, $arrParam);
//========================================================================================================================
$sum_all = array("c_cost_asset"=> 0, "f_depre"=>0, "f_acc_price"=>0);

while ($row = $db->Fetch($stmt))
{
	$i_row++;
	if ($cal_line==0 || $row_count>=$line_page)  #ตัดหัวกระดาษ ขึ้นหน้าใหม่
	{
		$i++;
		$data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";

		if ($cal_line > 0)
			$data .= "<tr>"
                                    ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ลำดับ>&nbsp;</td>"
                                    ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รหัสสินทรัพย์>&nbsp;</td>"
                                    ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ชื่อสินทรัพย์>&nbsp;</td>"
                                    ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=หมายเลขสินทรัพย์(เก่า)>&nbsp;</td>"
                                    ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ยี่ห้อ>&nbsp;</td>"
                                    ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=Serial No>&nbsp;</td>"
                                    ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รุ่น-แบบ>&nbsp;</td>"
                                    //."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รหัสหน่วยงาน>&nbsp;</td>"
                                    ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=หน่วยงาน>&nbsp;</td>"
                                    ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=วันที่ได้มา>&nbsp;</td>"
                                    ."<td align=right	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ราคาทุน>&nbsp;</td>"
                                    ."<td align=right	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ค่าเสื่อมราคาสะสม>&nbsp;</td>"
                                    ."<td align=right	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ราคาตามบัญชี>&nbsp;</td>"
                                    ."<td align=right	style=\"{$css_am_text_comment_close}\" 	valign=top	title=หมายเหตุ>&nbsp;</td>"
                                    ."</tr>"
                                    ."</table>";
		$data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
		$row_count=0;
	}

	if ($dataAssetGroup["asset_type"] == ASSET_TYPE_LAND) // ที่ดิน
	{
            $arr_data = check_line($row["asset_name"], $row["p_area"], $row["p_deed"], $row["p_num_area"], $fix_len_half_min);
	}
	else // สินทรัพย์
	{
            $arr_data = check_line($row["asset_name"], $row["c_brand"], $row["c_serial"], $row["c_model"], $fix_len_half_min);
	}
	$asset_name = ($arr_data["data"][1]["asset_name"] != "")? $arr_data["data"][1]["asset_name"] : "&nbsp;";
	$c_brand = ($arr_data["data"][1]["c_brand"] != "")? $arr_data["data"][1]["c_brand"] : "&nbsp;";
	$c_serial = ($arr_data["data"][1]["c_serial"] != "")? $arr_data["data"][1]["c_serial"] : "&nbsp;";
	$c_model = ($arr_data["data"][1]["c_model"] != "")? $arr_data["data"][1]["c_model"] : "&nbsp;";
	$d_receive_date = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : '';
	
	$data.="<tr>"
                ."<td align=center	style=\"{$css_am_text}\" nowrap	valign=top	title=ลำดับ>".$i_row."</td>"
                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=รหัสสินทรัพย์>".$row["asset_code"]."</td>"
                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=ชื่อสินทรัพย์>".$asset_name."</td>"
                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=หมายเลขสินทรัพย์(เก่า)>".$row["asset_code_old"]."&nbsp;</td>"
                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=ยี่ห้อ>".$c_brand."</td>"
                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=Serial No>".$c_serial."</td>"
                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=รุ่น-แบบ>".$c_model."</td>"
                //."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=รหัสหน่วยงาน>&nbsp;</td>"
                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=หน่วยงาน>".$row["cost_name"]."</td>"
                ."<td align=center	style=\"{$css_am_text}\" nowrap	valign=top	title=วันที่ได้มา>".$d_receive_date."</td>"
                ."<td align=right	style=\"{$css_am_text}\" nowrap	valign=top	title=ราคาทุน>".number_format($row["c_cost_asset"],2)."</td>"
                ."<td align=right	style=\"{$css_am_text}\" nowrap	valign=top	title=ค่าเสื่อมราคาสะสม>".number_format($row["f_depre"],2)."</td>"
                ."<td align=right	style=\"{$css_am_text}\" nowrap	valign=top	title=ราคาตามบัญชี>".number_format($row["f_acc_price"],2)."</td>"
                ."<td align=right	style=\"{$css_am_text_close}\" nowrap	valign=top	title=หมายเหตุ>".$row["c_comment"]."&nbsp;</td>"
                ."</tr>";
	$cal_line++;
	$row_count++;

	if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
	{ 
		$i++; 
		$data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";
		$data .= "<tr>"
                            ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ลำดับ>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รหัสสินทรัพย์>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ชื่อสินทรัพย์>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=หมายเลขสินทรัพย์(เก่า)>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ยี่ห้อ>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=Serial No>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รุ่น-แบบ>&nbsp;</td>"
                            //."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รหัสหน่วยงาน>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=หน่วยงาน>&nbsp;</td>"
                            ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=วันที่ได้มา>&nbsp;</td>"
                            ."<td align=right	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ราคาทุน>&nbsp;</td>"
                            ."<td align=right	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ค่าเสื่อมราคาสะสม>&nbsp;</td>"
                            ."<td align=right	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ราคาตามบัญชี>&nbsp;</td>"
                            ."<td align=right	style=\"{$css_am_text_comment_close}\" 	valign=top	title=หมายเหตุ>&nbsp;</td>"
                            ."</tr>"
                            ."</table>";
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
                                ."<td align=center	style=\"{$css_am_text}\" nowrap	valign=top	title=ลำดับ>&nbsp;</td>"
                                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=รหัสสินทรัพย์>&nbsp;</td>"
                                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=ชื่อสินทรัพย์>".$asset_name."</td>"
                                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=หมายเลขสินทรัพย์(เก่า)>&nbsp;</td>"
                                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=ยี่ห้อ>".$c_brand."</td>"
                                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=Serial No>".$c_serial."</td>"
                                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=รุ่น-แบบ>".$c_model."</td>"
                                //."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=รหัสหน่วยงาน>&nbsp;</td>"
                                ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top	title=หน่วยงาน>&nbsp;</td>"
                                ."<td align=center	style=\"{$css_am_text}\" nowrap	valign=top	title=วันที่ได้มา>&nbsp;</td>"
                                ."<td align=right	style=\"{$css_am_text}\" nowrap	valign=top	title=ราคาทุน>&nbsp;</td>"
                                ."<td align=right	style=\"{$css_am_text}\" nowrap	valign=top	title=ค่าเสื่อมราคาสะสม>&nbsp;</td>"
                                ."<td align=right	style=\"{$css_am_text}\" nowrap	valign=top	title=ราคาตามบัญชี>&nbsp;</td>"
                                ."<td align=right	style=\"{$css_am_text_close}\" 	valign=top	title=หมายเหตุ>&nbsp;</td>"
                                ."</tr>";
			$cal_line++;
			$row_count++;

			if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
			{ 
                            $i++; 
                            $data_hdr["2"]	= "<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">หน้า $i / $all_page</td></tr>";
                            $data .= "<tr>"
                                        ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ลำดับ>&nbsp;</td>"
                                        ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รหัสสินทรัพย์>&nbsp;</td>"
                                        ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ชื่อสินทรัพย์>&nbsp;</td>"
                                        ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=หมายเลขสินทรัพย์(เก่า)>&nbsp;</td>"
                                        ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ยี่ห้อ>&nbsp;</td>"
                                        ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=Serial No>&nbsp;</td>"
                                        ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รุ่น-แบบ>&nbsp;</td>"
                                        //."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รหัสหน่วยงาน>&nbsp;</td>"
                                        ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=หน่วยงาน>&nbsp;</td>"
                                        ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=วันที่ได้มา>&nbsp;</td>"
                                        ."<td align=right	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ราคาทุน>&nbsp;</td>"
                                        ."<td align=right	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ค่าเสื่อมราคาสะสม>&nbsp;</td>"
                                        ."<td align=right	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ราคาตามบัญชี>&nbsp;</td>"
                                        ."<td align=right	style=\"{$css_am_text_comment_close}\" 	valign=top	title=หมายเหตุ>&nbsp;</td>"
                                        ."</tr>"
                                        ."</table>";
                            $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"].$data_hdr["4"]; 
                            $row_count=0;
			}
		}
	}

	$sum_all["c_cost_asset"] += round($row["c_cost_asset"],2);
	$sum_all["f_depre"]		+= round($row["f_depre"],2);
	$sum_all["f_acc_price"]	+= round($row["f_acc_price"],2);
	
}// end while
//========================================================================================================================
$data.="<tr>"
        ."<th align=right style=\"{$css_am_text_comment}\" colspan=\"10\">รวมทั้งหมด </th>"
        ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all["c_cost_asset"],2)."</th>"
        ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all["f_depre"],2)."</th>"
        ."<th align=right style=\"{$css_am_text_comment}\">".number_format($sum_all["f_acc_price"],2)."</th>"
        ."<th align=right style=\"{$css_am_text_comment_close}\">&nbsp;</th>"
        ."</tr>";

$maxpage = $i;
$data .="</table>";
$data = str_replace ("MYPAGE",$maxpage,$data);

//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$data); 			
?>
