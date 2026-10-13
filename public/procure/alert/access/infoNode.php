<?php
require_once("../conf/config.php");
//$_SESSION["user_id"] = intval($data["dc_user_id"]); //id ผู้ใช้งาน
//$_SESSION["user_name"] = $data["c_full_name"]; //ชื่อผู้ใช้งาน
//$_SESSION["dc_emp_id"] = intval($data["dc_emp_id"]); //พนักงานผู้รับผิดชอบ
//// c_sp_emp c_department_type c_department c_position sp_emp_id dc_department_id dc_department_type_id i_seq i_level
//$_SESSION["sp_emp_id"] = intval($data["sp_emp_id"]) ?? null; //
//$_SESSION["dc_department_id"] = intval($data["dc_department_id"]) ?? null; //
//$_SESSION["dc_department_type_id"] = intval($data["dc_department_type_id"]) ?? null; //
//$_SESSION["i_seq"] = intval($data["i_seq"]) ?? null; //
//$_SESSION["i_level"] = intval($data["i_level"]) ?? null; //
//
//$_SESSION["c_sp_emp"] = $data["c_sp_emp"] ?? null; //
//$_SESSION["c_department_type"] = $data["c_department_type"] ?? null; //
//$_SESSION["c_department"] = $data["c_department"] ?? null; //
//$_SESSION["c_position"] = $data["c_position"] ?? null; //
//
//$_SESSION["dc_cost_id"] = intval($data["dc_cost_id"]); //id หน่วยงาน
//$_SESSION["cost_name"] = $data["cost_name"]; //หน่วยงาน
//$_SESSION["cost_code"] = $data["cost_code"]; //รหัสหน่วยงาน
//$_SESSION["dc_area_id"] = intval($data["dc_area_id"]); //id หน่วยธุรกิจ
//$_SESSION["i_type_user"] = intval($data["i_type_user"]); //ประเภทผู้ใช้งาน
//$_SESSION["dc_cost_acc_id"] = intval($data["dc_cost_acc_id"]); //id ศูนย์ต้นทุนทางบัญชีของหน่วยงานที่ log in
//$_SESSION["last_login"] = date("Y-m-d H:i:s");
//$_SESSION["cookies"] =;

$re = array("reval" => 0, "success" => "Success", "msg" => "Login Success", "data" => ($_SESSION ?? null));

 echo json_encode($re);
exit;
