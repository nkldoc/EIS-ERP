<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/date/i_date.class.php");

//print_r($_REQUEST);
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

//iSearch
$i_enable = $_REQUEST["i_enable"];
$arrStatus = array("0"=>"ทั้งหมด", STATUS_ENABLE=>"ใช้งาน", STATUS_DISABLE=>"ไม่ใช้งาน");
$where = "";
if ($i_enable > 0)
    $where .= " and i_enable = {$i_enable}";
$sql = "SELECT c_name, c_comment, i_enable
        FROM vw_dc_title a
        WHERE 1 = ? {$where}
        ORDER BY a.c_name;";

$stmt = $db->QueryParam($sql, array(1));
$i = 1;
$str = "";
while ($data = $db->Fetch($stmt))
{
    $str .= "<tr>"
            ."<td align='left'>{$data["c_name"]}</td>"
            ."<td align='left'>{$data["c_comment"]}</td>"
            ."<td align='center' >".$arrStatus[$data["i_enable"]]."</td>"
            ."</tr>";
    $i++;
}// end while

if ($str == "")
    $str = "ไม่พบข้อมูล";

$str = "<table cellspacing='0' cellpadding='0' width='100%' border='0' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
            <tr><th colspan='3'>{$_REQUEST['titleReport']}</th></tr>
            <tr><th colspan='3'>สถานะ {$arrStatus[$i_enable]}</th></tr>
        </table>
        <table cellspacing='0' cellpadding='0' width='100%' border='1' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
            <tr bgcolor='#A5BAD6'>
                <th width='5%' align='center'><b>ชื่อคำนำหน้า</b></th>
                <th width='5%' align='center'><b>คำอธิบาย</b></th>
                <th width='5%' align='center'><b>สถานะ</b></th>
            </tr>
            {$str}
        </table>
        ";

if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str); 			
?>