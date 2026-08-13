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

function check_line($asset_name, $c_brand, $c_model, $c_serial, $c_comment, $fix_len)
{
	$arr_row = array();
	$arr_row[] = ceil((mb_strlen($asset_name, 'utf-8')/$fix_len));
	$arr_row[] = ceil((mb_strlen($c_brand, 'utf-8')/$fix_len));
	$arr_row[] = ceil((mb_strlen($c_model, 'utf-8')/$fix_len));
        $arr_row[] = ceil((mb_strlen($c_serial, 'utf-8')/$fix_len));
	$arr_row[] = ceil((mb_strlen($c_comment, 'utf-8')/$fix_len));
        
	$row = max($arr_row);

	$data["row"] = $row;
	for ($i = 1; $i <= $row; $i++)
	{
		$data["data"][$i]["asset_name"] = iconv_substr($asset_name, (($i-1)*($fix_len)), $fix_len, 'utf-8');
		$data["data"][$i]["c_brand"] = iconv_substr($c_brand, (($i-1)*($fix_len)), $fix_len, 'utf-8');
                $data["data"][$i]["c_model"] = iconv_substr($c_model, (($i-1)*($fix_len)), $fix_len, 'utf-8');
		$data["data"][$i]["c_serial"] = iconv_substr($c_serial, (($i-1)*($fix_len)), $fix_len, 'utf-8');
                $data["data"][$i]["c_comment"] = iconv_substr($c_comment, (($i-1)*($fix_len)), $fix_len, 'utf-8');
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
$dc_cost_id = $_REQUEST["dc_cost_id"];
$sd_code = $_REQUEST["sd_code"];

$path_logo = "../../../images/mcot11.gif"; 
//style
$css_gl_title = "font-size: 18px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000; font-weight:bold;";
$css_gl_hdr = "font-size: 14px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000; font-weight:bold;";
$css_gl_top_bottom_left = "border-bottom: 2px solid Black; border-bottom-width: 1px; border-top: 2px solid Black; border-top-width: 1px; border-left: 2px solid Black; border-left-width: 1px; FONT-SIZE: 12px;  COLOR: #00000;  FONT-FAMILY: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; font-weight:bold;";
$css_gl_top_bottom_all = "border-bottom: 2px solid Black; border-bottom-width: 1px; border-top: 2px solid Black; border-top-width: 1px; border-left: 2px solid Black; border-left-width: 1px; border-right: 2px solid Black; border-right-width: 1px; FONT-SIZE: 12px;  COLOR: #00000;  FONT-FAMILY: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; font-weight:bold;";
$css_am_text = "border-left: 1px solid Black; font-size: 10px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000;";
$css_am_text_close = "border-left: 1px solid Black; border-right: 1px solid Black; font-size: 10px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000;";
$css_gl_information	= "font-size: 10px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000; font-weight:bold;";
$css_am_text_comment = "border-bottom: 1px solid Black; border-left: 1px solid Black; font-size: 10px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000; font-weight:bold;";
$css_am_text_comment_close = "border-bottom: 1px solid Black; border-left: 1px solid Black; border-right: 1px solid Black; font-size: 10px; font-family: Mod SSS,sans-serif,Arial,tahoma,AngsanaUPC; COLOR: #000000; font-weight:bold;";
//===========================================
$reportColumn = 9;

//หัวรายงาน = ชื่อรายงาน+หน้า
$tb_w = "100%"; 

$data_hdr["0"]	= "<table width=\"$tb_w\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" bgcolor=\"FFFFFF\" style=\"page-break-after: always;\">"
                //. "<tr><td colspan=".($reportColumn)." align=\"center\"><img src=\"{$path_logo}\" width=160 height=103 border=0></td></tr>"
                . "<tr><td colspan=".($reportColumn)." align=\"center\" style=\"{$css_gl_title}\">ใบรักษาของ</td></tr>";

$data_hdr["1"]	= "";

$data_hdr["2"]	= "";

$data_hdr["3"]	= "<tr bgcolor=#A5BAD6>"
                    ."		<th width=5% style=\"{$css_gl_top_bottom_left}\" nowrap>ลำดับ</th>"
                    ."		<th width=15% style=\"{$css_gl_top_bottom_left}\" nowrap>รายการทรัพย์สิน</th>"
                    ."		<th width=5% style=\"{$css_gl_top_bottom_left}\" nowrap>จำนวน</th>"
                    ."		<th width=15% style=\"{$css_gl_top_bottom_left}\" nowrap>ยี่ห้อ/จำนวนเนื้อที่</th>"
                    ."		<th width=15% style=\"{$css_gl_top_bottom_left}\" nowrap>แบบ/เลขที่ นส.3ก</th>"
                    ."		<th width=15% style=\"{$css_gl_top_bottom_left}\" nowrap>Serial NO/เลขที่โฉนด</th>"
                    ."		<th width=8% style=\"{$css_gl_top_bottom_left}\" nowrap>หมายเลขทรัพย์สิน</th>"
                    ."		<th width=7% style=\"{$css_gl_top_bottom_left}\" nowrap>วันที่ได้มาของสินทรัพย์</th>"
                    ."		<th width=15% style=\"{$css_gl_top_bottom_all}\" nowrap>หมายเหตุ</th>"
                    ."	</tr>";

$line_page          = 50; //จำนวนบรรทัดต่อ 1 หน้า	
$fix_len_half_min   = 50; //จำนวนตัวหนังสือที่จะขึ้นบรรทัดใหม่

$i = 0; // หน้าที่
$cal_line = 0; // นับจำนวนแถวทั้งหมด
$data = "";
$row_count = 0; // นับจำนวนแถวต่อหน้า

$all_page = "MYPAGE";
$i_row = 0; // รายการ
//===========================================

$arrParam[] = 1;

$sqlWhere = "";
if ($asset_type != "")
{
    $sqlWhere .= " and c.c_code like ?";
    $arrParam[] = "{$asset_type}%";
}
else if ($asset_group != "")
{
    $sqlWhere .= " and c.c_code like ?";
    $arrParam[] = "{$asset_group}%";
}

if ($dc_cost_id > 0)
{
    $sqlWhere .= " and d.dc_cost_id = ?";
    $arrParam[] = $dc_cost_id;
}

if ($sd_code != "")
{
    $sqlWhere .= " and a.c_code = ?";
    $arrParam[] = $sd_code;
}
$sql = "declare @status_tb as tinyint;
        set @status_tb = ?;

        select d.c_code as cost_code
            , d.c_name as cost_name
            , a.c_code as sd_code
            , b.c_name as asset_name
            , c.f_quan
            , (select bb.c_name from dc_asset_type aa inner join dc_unit_type bb on aa.dc_unit_type_id = bb.dc_unit_type_id where aa.dc_asset_type_id = c.dc_asset_type_id) as unit_name
            , case when left(c.c_code, 2) = '01' then isnull(b.p_area, '-') else isnull(b.c_brand, '-') end as col1
            , case when left(c.c_code, 2) = '01' then isnull(b.p_num_area, '-') else isnull(b.c_model, '-') end as col2
            , case when left(c.c_code, 2) = '01' then isnull(b.p_deed, '-') else isnull(b.c_serial, '-') end as col3
            , c.c_code as asset_code
            , isnull(convert(varchar(10), b.d_receive_date, 120), '') as d_receive_date
            , isnull(b.c_comment,'') as c_comment
        from am_tran_rg_hdr a
            inner join am_tran_rg_dtl b on a.am_tran_rg_hdr_id = b.am_tran_rg_hdr_id
            inner join dc_asset c on b.am_tran_rg_dtl_id = c.am_tran_rg_dtl_id
            inner join dc_cost d on case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end = d.dc_cost_id
        where b.i_is_success = '1'
            and case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end is not null 
            and case when c.dc_cost_id_ta is not null then c.dc_cost_id_ta  else c.dc_cost_id end !='0' 
            and case when c.bt_date is not null then 2 else 1 end = @status_tb
            {$sqlWhere}
        order by cost_code, sd_code, asset_code";
//echo $sqlWhere; print_r($arrParam);exit;
$stmt = $db->QueryParam($sql, $arrParam);
//========================================================================================================================
$tempSD = "";
while ($row = $db->Fetch($stmt))
{
	$i_row++;
        
        if ($tempSD != $row["sd_code"])
        {
            if ($cal_line > 0)
            {
                $data .= "<tr>"
                            ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ลำดับ>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รายการทรัพย์สิน>&nbsp;</td>"
                            ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=จำนวน>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ยี่ห้อ/จำนวนเนื้อที่>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=แบบ/เลขที่ นส.3ก>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=Serial NO/เลขที่โฉนด>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=หมายเลขทรัพย์สิน>&nbsp;</td>"
                            ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=วันที่ได้มาของสินทรัพย์>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment_close}\" 	valign=top	title=หมายเหตุ>&nbsp;</td>"
                        ."</tr>"
                        ."<tr><td colspan=".($reportColumn).">&nbsp;</td></tr>"
                        ."<tr>
                                <td colspan=".($reportColumn-3).">&nbsp;</td>
                                <td colspan=3 style=\"{$css_gl_hdr}\" align=\"center\" nowrap>
                                        ลงชื่อ ........................................... ผู้รักษาของ<br>
                                                (............................................)<br>
                                        วันที่.......เดือน.................ปี.........
                                </td>
                            </tr>"
                        ."</table>";
		$row_count=0;
                $i_row = 1;
            }
            $i++;
            $data_hdr["1"] = "<tr><td colspan={$reportColumn} nowrap align=right style=\"{$css_gl_information}\">แผ่นที่ $i</td></tr>";
            $data_hdr["2"] = "<tr><td colspan=".($reportColumn-3)." align=left style=\"{$css_gl_hdr}\">หน่วยงาน : {$row["cost_code"]} {$row["cost_name"]}</td>"
                            ."<td colspan=3 nowrap align=right style=\"{$css_gl_information}\">เลขที่นำเข้าสินทรัพย์ : {$row["sd_code"]}</td></tr>";
            $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"]; 
            $tempSD = $row["sd_code"];
        }

	$arr_data = check_line($row["asset_name"], $row["col1"], $row["col2"], $row["col3"], $row["c_comment"], $fix_len_half_min);
        
	$asset_name = ($arr_data["data"][1]["asset_name"] != "")? $arr_data["data"][1]["asset_name"] : "&nbsp;";
	$c_brand = ($arr_data["data"][1]["c_brand"] != "")? $arr_data["data"][1]["c_brand"] : "&nbsp;";
	$c_model = ($arr_data["data"][1]["c_model"] != "")? $arr_data["data"][1]["c_model"] : "&nbsp;";
        $c_serial = ($arr_data["data"][1]["c_serial"] != "")? $arr_data["data"][1]["c_serial"] : "&nbsp;";
        $c_comment = ($arr_data["data"][1]["c_comment"] != "")? $arr_data["data"][1]["c_comment"] : "&nbsp;";
	
	$d_receive_date = ($row["d_receive_date"] != "")? $date->shot_date_from_db($row["d_receive_date"]) : '';
	
        $data .= "<tr>"
                    ."<td align=center	style=\"{$css_am_text}\" nowrap	valign=top  title=ลำดับ>&nbsp;".$i_row."</td>"
                    ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top  title=รายการทรัพย์สิน>&nbsp;{$asset_name}</td>"
                    ."<td align=center	style=\"{$css_am_text}\" nowrap	valign=top  title=จำนวน>&nbsp;{$row["f_quan"]} {$row["unit_name"]}</td>"
                    ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top  title=ยี่ห้อ/จำนวนเนื้อที่>&nbsp;{$c_brand}</td>"
                    ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top  title=แบบ/เลขที่ นส.3ก>&nbsp;{$c_model}</td>"
                    ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top  title=Serial NO/เลขที่โฉนด>&nbsp;{$c_serial}</td>"
                    ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top  title=หมายเลขทรัพย์สิน>&nbsp;{$row["asset_code"]}</td>"
                    ."<td align=center	style=\"{$css_am_text}\" nowrap	valign=top  title=วันที่ได้มาของสินทรัพย์>&nbsp;{$d_receive_date}</td>"
                    ."<td align=left	style=\"{$css_am_text_close}\" nowrap	valign=top  title=หมายเหตุ>&nbsp;{$c_comment}</td>"
                   ."</tr>";
	
	$cal_line++;
	$row_count++;

	if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
	{ 
		$i++; 
		$data_hdr["1"] = "<tr><td colspan={$reportColumn} nowrap align=right style=\"{$css_gl_information}\">แผ่นที่ $i</td></tr>";
		$data .= "<tr>"
                            ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ลำดับ>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รายการทรัพย์สิน>&nbsp;</td>"
                            ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=จำนวน>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ยี่ห้อ/จำนวนเนื้อที่>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=แบบ/เลขที่ นส.3ก>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=Serial NO/เลขที่โฉนด>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=หมายเลขทรัพย์สิน>&nbsp;</td>"
                            ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=วันที่ได้มาของสินทรัพย์>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_comment_close}\" 	valign=top	title=หมายเหตุ>&nbsp;</td>"
                        ."</tr>"
                        ."<tr><td colspan=".($reportColumn).">&nbsp;</td></tr>"
                        ."<tr>
                            <td colspan=".($reportColumn-3).">&nbsp;</td>
                            <td colspan=3 style=\"{$css_gl_hdr}\" align=\"center\" nowrap>
                                    ลงชื่อ ........................................... ผู้รักษาของ<br>
                                            (............................................)<br>
                                    วันที่.......เดือน.................ปี.........
                            </td>
                        </tr>"
                        ."</table>";
		$data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"]; 
		$row_count=0;
                $i_row = 0;
	}

	if ($arr_data["row"] > 1)
	{
            for ($ii=2; $ii <= $arr_data["row"]; $ii++)
            {
                $asset_name = ($arr_data["data"][$ii]["asset_name"] != "")? $arr_data["data"][$ii]["asset_name"] : "&nbsp;";
                $c_brand = ($arr_data["data"][$ii]["c_brand"] != "")? $arr_data["data"][$ii]["c_brand"] : "&nbsp;";
                $c_model = ($arr_data["data"][$ii]["c_model"] != "")? $arr_data["data"][$ii]["c_model"] : "&nbsp;";
                $c_serial = ($arr_data["data"][$ii]["c_serial"] != "")? $arr_data["data"][$ii]["c_serial"] : "&nbsp;";
                $c_comment = ($arr_data["data"][$ii]["c_comment"] != "")? $arr_data["data"][$ii]["c_comment"] : "&nbsp;";

                $data .= "<tr>"
                            ."<td align=center	style=\"{$css_am_text}\" nowrap	valign=top  title=ลำดับ>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top  title=รายการทรัพย์สิน>&nbsp;{$asset_name}</td>"
                            ."<td align=center	style=\"{$css_am_text}\" nowrap	valign=top  title=จำนวน>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top  title=ยี่ห้อ/จำนวนเนื้อที่>&nbsp;{$c_brand}</td>"
                            ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top  title=แบบ/เลขที่ นส.3ก>&nbsp;{$c_model}</td>"
                            ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top  title=Serial NO/เลขที่โฉนด>&nbsp;{$c_serial}</td>"
                            ."<td align=left	style=\"{$css_am_text}\" nowrap	valign=top  title=หมายเลขทรัพย์สิน>&nbsp;</td>"
                            ."<td align=center	style=\"{$css_am_text}\" nowrap	valign=top  title=วันที่ได้มาของสินทรัพย์>&nbsp;</td>"
                            ."<td align=left	style=\"{$css_am_text_close}\" nowrap	valign=top  title=หมายเหตุ>&nbsp;{$c_comment}</td>"
                        ."</tr>";
                $cal_line++;
                $row_count++;

                if ($row_count >= $line_page) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
                { 
                    $i++; 
                    $data_hdr["1"] = "<tr><td colspan={$reportColumn} nowrap align=right style=\"{$css_gl_information}\">แผ่นที่ $i</td></tr>";
                    $data .= "<tr>"
                                ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ลำดับ>&nbsp;</td>"
                                ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รายการทรัพย์สิน>&nbsp;</td>"
                                ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=จำนวน>&nbsp;</td>"
                                ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ยี่ห้อ/จำนวนเนื้อที่>&nbsp;</td>"
                                ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=แบบ/เลขที่ นส.3ก>&nbsp;</td>"
                                ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=Serial NO/เลขที่โฉนด>&nbsp;</td>"
                                ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=หมายเลขทรัพย์สิน>&nbsp;</td>"
                                ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=วันที่ได้มาของสินทรัพย์>&nbsp;</td>"
                                ."<td align=left	style=\"{$css_am_text_comment_close}\" 	valign=top	title=หมายเหตุ>&nbsp;</td>"
                            ."</tr>"
                            ."<tr><td colspan=".($reportColumn).">&nbsp;</td></tr>"
                            ."<tr>
                                <td colspan=".($reportColumn-3).">&nbsp;</td>
                                <td colspan=3 style=\"{$css_gl_hdr}\" align=\"center\" nowrap>
                                        ลงชื่อ ........................................... ผู้รักษาของ<br>
                                                (............................................)<br>
                                        วันที่.......เดือน.................ปี.........
                                </td>
                            </tr>"
                            ."</table>";
                    $data .= $data_hdr["0"].$data_hdr["1"].$data_hdr["2"].$data_hdr["3"]; 
                    $row_count=0;
                    $i_row = 0;
                }
            }
	}

}// end while
//========================================================================================================================

if ($row_count > 0) #ตัดหัวกระดาษ ขึ้นหน้าใหม่
{ 
    $i++; 
    $data_hdr["1"] = "<tr><td colspan={$reportColumn} nowrap align=right style=\"{$css_gl_information}\">แผ่นที่ $i</td></tr>";
    $data .= "<tr>"
                ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ลำดับ>&nbsp;</td>"
                ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=รายการทรัพย์สิน>&nbsp;</td>"
                ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=จำนวน>&nbsp;</td>"
                ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=ยี่ห้อ/จำนวนเนื้อที่>&nbsp;</td>"
                ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=แบบ/เลขที่ นส.3ก>&nbsp;</td>"
                ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=Serial NO/เลขที่โฉนด>&nbsp;</td>"
                ."<td align=left	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=หมายเลขทรัพย์สิน>&nbsp;</td>"
                ."<td align=center	style=\"{$css_am_text_comment}\" nowrap	valign=top	title=วันที่ได้มาของสินทรัพย์>&nbsp;</td>"
                ."<td align=left	style=\"{$css_am_text_comment_close}\" 	valign=top	title=หมายเหตุ>&nbsp;</td>"
            ."</tr>"
            ."<tr><td colspan=".($reportColumn).">&nbsp;</td></tr>"
            ."<tr>
                <td colspan=".($reportColumn-3).">&nbsp;</td>
                <td colspan=3 style=\"{$css_gl_hdr}\" align=\"center\" nowrap>
                        ลงชื่อ ........................................... ผู้รักษาของ<br>
                                (............................................)<br>
                        วันที่.......เดือน.................ปี.........
                </td>
            </tr>"
            ."</table>";
}

//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$data); 			
?>
