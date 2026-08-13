<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

header("Content-Type: text/x-csv");
header("Content-Disposition: attachment; filename=import.csv");
header("Expires: 0");
header("Pragma: no-cache");

$str	= "รหัสสินทรัพย์\tรายการสินทรัพย์\tยี่ห้อ\tรุ่น-แบบ\tรหัส\tแบบ/ขนาด\tวิธีการนำเข้า\tหมายเลขตัวถัง\tหมายเลขเครื่อง\tทะเบียนรถยนต์\tเลขทะเบียนสินทรัพย์เก่า\tราคาสินทรัพย์เมื่อมีการนำข้อมูลเข้า\tราคาซาก\tอายุการใช้งาน (ปี)\tค่าเสื่อมราคา";
$str 	.= "\tจำนวนเนี้อที่(ตารางเมตร)\tเลขที่โฉนด\tเลขที่ นส.3ก\tแยกตามภูมิภาค\tแยกตามจังหวัด\tรหัสหน่วยงาน\tวีธีการได้มาของสินทรัพย์\tวันที่ขึ้นทะเบียน (เดือน/วัน/ปี ค.ศ.)";
$str 	.= "\tวันที่ได้รับสินทรัพย์ (เดือน/วัน/ปี ค.ศ.)\tวันที่เริ่มต้นประกัน (เดือน/วัน/ปี ค.ศ.)\tวันที่สิ้นสุดประกัน (เดือน/วัน/ปี ค.ศ.)\tวันที่เริ่มต้นคิดค่าเสื่อมราคา (เดือน/วัน/ปี ค.ศ.)";
$str 	.= "\tชื่อหน่วยงานภายนอกผู้โอน/บริจาคสินทรัพย์\tหมายเหตุ\tเลขที่ใบสำคัญ\tวันที่ใบสำคัญ(เดือน/วัน/ปี ค.ศ.)\n";

$str	.= "c_code\t c_name\t c_brand\t c_model\t c_serial\t c_type\t c_method_type\t c_number_body\t c_number_mech\t c_car_license\t c_asset_code_old\t c_cost_asset\t c_cost_ruins\t i_period_year\t f_depreciate";
$str 	.= "\t p_area\t p_deed\t p_num_area\t p_division\t p_province\t dc_cost_id\t dc_asset_method_id\t d_register_date";
$str	.= "\t d_receive_date\t d_start_warranty\t d_end_warranty\t d_depreciate";
$str	.= "\t c_ext_cnt\t c_comment\t c_doc_imp\t d_doc_imp";
echo chr(255).chr(254).iconv("UTF-8", "UTF-16LE//IGNORE", $str);

/* 
$sql	= "SELECT * FROM dc_acc WHERE i_group=? AND i_last=? AND i_enable=? AND i_delete=? ORDER BY c_code";

$arrParam[]	= $_REQUEST["i_group"];
$arrParam[]	= 1;
$arrParam[]	= STATUS_ENABLE;
$arrParam[]	= DELETE_FALSE;

$stmt = $db->QueryParam($sql, $arrParam);
if($stmt) {
	while($row =$db->Fetch($stmt)) {
		
		$str	= $row["c_code"]."\t";
		$str	.= $row["c_name"]."\n";
		
		echo chr(255).chr(254).iconv("UTF-8", "UTF-16LE//IGNORE", $str);
	}
} */
exit;
?>