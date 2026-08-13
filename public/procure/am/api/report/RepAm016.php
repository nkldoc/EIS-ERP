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
 
###################
$db 	= new DatabaseServer();
$date 	= new i_date();
########################################################################## 
//print_r($_REQUEST);exit;
//iSearch
$dc_building_id = $_REQUEST["dc_building_id"];
$i_enable = $_REQUEST["i_enable"];
//===========================================
$arrParam[] = DELETE_FALSE;

$sqlWhere = "";
if ($dc_building_id > 0)
{
    $sqlWhere .= " and a.dc_building_id = ?";
    $arrParam[] = $dc_building_id;
}

if ($i_enable > 0)
{
    $sqlWhere .= " and c.i_enable = ?";
    $arrParam[] = $i_enable;
}

$sql = "select c.c_code as build_code
            , c.c_name as build_name
            , case c.i_type_region when 1 then 'ส่วนกลาง' else 'ส่วนภูมิภาค' end as region_name
            , case c.i_enable when 1 then 'ใช้งาน' else 'ไม่ใช้งาน' end as status_name
            , c.c_addr
            , a.c_name as head_name
            , b.c_code, b.c_name 
        from dc_ins_town_hdr a
            inner join dc_ins_town_dtl b on a.dc_ins_town_hdr_id = b.dc_ins_town_hdr_id
            inner join dc_building c on a.dc_building_id = c.dc_building_id
        where c.i_delete = ?
            {$sqlWhere}
        order by c.c_code, a.c_name, b.c_code";
//echo $sqlWhere ; print_r($arrParam);exit;
$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$str = "";
$countItems = 0;
$countHdr = 0;

$tempBuild = "";
$tempTownHdr = "";

while ($row = $db->Fetch($stmt))
{
    if ($tempBuild != $row["build_code"])
    {
        $str .= "<tr bgcolor='#E2E8E9'>"
                    ."<td align='left' colspan='3'>"
                        ."<b>กลุ่มอาคาร/สถานที่เอาประกัน :</b> {$row["build_code"]} {$row["build_name"]}<br />"
                        ."<b>พื้นที่การใช้งาน :</b> {$row["region_name"]} <b>สถานะ :</b>{$row["status_name"]}<br />"
                        ."<b>ที่อยู่ :</b> {$row["c_addr"]}"
                    ."</td>"
                ."</tr>";
                
        $countItems = 0;
        $tempBuild = $row["build_code"];
    }
    
    if ($tempTownHdr != $row["head_name"])
    {
        $countItems++;
        $countHdr++;
        $hdr_name = $row["head_name"];
        $str_row = $countItems.".";
        $tempTownHdr = $row["head_name"];
    }
    else 
    {
        $str_row = "&nbsp;";
        $hdr_name = "&nbsp;";
    }

    $str .= "<tr>"
                ."<td align='center'>{$str_row}</td>"
                ."<td align='left' nowrap>&nbsp;{$hdr_name}</td>"
                ."<td align='left' nowrap>&nbsp;{$row["c_code"]} {$row["c_name"]}</td>"
        ."</tr>";
}// end while
$str .= "<tr bgcolor='#C6D2D1'>"
            ."<td align='left' colspan='3'>รวม <u>{$countHdr}</u> กลุ่มอาคาร/สถานที่เอาประกัน</td>"
        ."</tr>"
        ."</table>";

//-------------------------------------

$buildName = ($dc_building_id > 0)? $db->GetDataBySQL("select c_code+' '+c_name from dc_building where dc_building_id = ?", array($dc_building_id)) : "เลือกทั้งหมด";
if ($i_enable > 0)
{
    $status_name = ($i_enable == 1)? "ใช้งาน" : "ไม่ใช้งาน";
}
else
    $status_name = "เลือกทั้งหมด";
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                        <tr><th colspan="3">'.$_REQUEST["titleReport"].'</th></tr>
                        <tr><th colspan="3" align="left">กลุ่มอาคาร/สถานที่เอาประกัน : '.$buildName.'</th></tr>
                        <tr><th colspan="3" align="left">สถานะ : '.$status_name.'</th></tr>
		</table>
		<table cellspacing="0" cellpadding="3" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
                    <tr bgcolor="#A5BAD6">
                        <th align="center" nowrap><b>ลำดับที่</b></th>
                        <th align="center" nowrap><b>ชื่ออาคาร</b></th>
                        <th align="center" nowrap><b>หน่วยงาน</b></th>
                    </tr>
'.$str;
//-------------------------------------
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str);
?>