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
	
//iSearch
$asset_code = $_REQUEST["asset_code"];
$i_status = $_REQUEST["i_status"];

$arr_status = array(0=>"ทั้งหมด", STATUS_ENABLE=>"<font color='blue'>ใช้งาน</font>", STATUS_DISABLE=>"<font color='red'>ไม่ใช้งาน</font>");

$strWhere = "";
if ($asset_code != "" || $i_status > 0)
{
	$strWhere = "WHERE 1=1 ";
	$strWhere .= ($asset_code != "")? " AND c_code LIKE '{$asset_code}%'" : "";
	$strWhere .= ($i_status > 0)? " AND i_enable = '{$i_status}'" : "";
}

$sql = "SELECT *
		FROM (SELECT a.c_code, a.c_name, a.f_unit_cost, b.c_name as unit_name, a.i_enable, 2 as i_type 
			FROM vw_dc_asset_type a
                            INNER JOIN dc_unit_type b ON a.dc_unit_type_id = b.dc_unit_type_id
			WHERE i_is_last = ? AND asset_type != ?
			UNION
			SELECT c_code, c_name, 0.00 as f_unit_cost, '' as unit_name, i_enable, 1 as i_type FROM vw_dc_asset_type 
			WHERE i_level = ? AND asset_type != ?) a
		{$strWhere}
		ORDER BY c_code";
$arrParam = array(I_LAST, ASSET_TYPE_SUPPLIE, TREE_LEVEL_MAP_ACC, ASSET_TYPE_SUPPLIE);
//echo $sql; print_r($arrParam);

$stmt = $db->QueryParam($sql, $arrParam);
$arr = array();

$chkInv = "";

$str = "";
$i = 1;
$countType = 0;
$countItems = 0;

while ($row = $db->Fetch($stmt))
{
	if ($row["i_type"] == 1){ // หมวดย่อย
            $str .= "<tr bgcolor='#E2E8E9'>"
                        ."<td align='left' colspan='6'>{$row["c_code"]} - {$row["c_name"]}</td>"
                    ."</tr>";
            $countType++;
            $i = 1;
	} else {
            $strStatus = ($row["i_enable"] == STATUS_ENABLE)? "<font color='blue'>ใช้งาน</font>" : "<font color='blue'>ไม่ใช้งาน</font>";
            $str .= "<tr>"
                        ."<td align='center'>{$i}.</td>"
                        ."<td align='center'>&nbsp;{$row["c_code"]}</td>"
                        ."<td align='left'>{$row["c_name"]}</td>"
                        ."<td align='right' >".number_format($row["f_unit_cost"],2)."</td>"
                        ."<td align='center'>{$row["unit_name"]}</td>"
                        ."<td align='center' >{$strStatus}</td>"
                    ."</tr>";

            $countItems++;
            $i++;
	}
	
}// end while
$str .= "<tr bgcolor='#E2E8E9'>"
            ."<td align='left' colspan='6'>รวม {$countItems} รายการ</td>"
        ."</tr>"
        ."<tr bgcolor='#E2E8E9'>"
            ."<td align='left' colspan='6'>รวม {$countType} หมวดสินทรัพย์ย่อย</td>"
        ."</tr>"
    ."</table>";

//-------------------------------------
$sqlGet = "SELECT c_code+' '+c_name FROM vw_dc_asset_type WHERE c_code = {$asset_code}";
$invTypeName = ($asset_code != "")? $db->GetDataBySQL($sqlGet, array($asset_code)) : "ทุกหน่วยงาน";
$str = '<table cellspacing="0" cellpadding="0" width="100%" border="0" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr><th colspan="6">รายงานข้อมูลหลักสินทรัพย์ถาวร</th></tr>
			<tr><th colspan="6">หมวดสินทรัพย์ : '.$invTypeName.'</th></tr>
		</table>
		<table cellspacing="0" cellpadding="0" width="100%" border="1" style="border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt">
			<tr bgcolor="#A5BAD6">
                            <th align="center"><b>ลำดับ</b></th>
                            <th align="center"><b>รหัสสินทรัพย์</b></th>
                            <th align="center"><b>รายการสินทรัพย์</b></th>
                            <th align="center"><b>ราคามาตรฐาน</b></th>
                            <th align="center"><b>หน่วยนับ</b></th>
                            <th align="center"><b>สถานะ</b></th>
			</tr>
'.$str;
if(isset($_REQUEST['mode'])) headerX($_REQUEST['mode'],$str); 			
?>