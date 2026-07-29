<?PHP 

require_once("../conf/config.php");
require_once("../lib/database/DatabaseServer.php");

if (isset($_POST["userf"]) && isset($_POST["passwordf"])) {
    $db = new DatabaseServer();
    // เพิ่ม ระดับ แผนกและสายงาน
    //dc_department_type_id department_type_name dc_department_id department_name

    $sql = "select a.dc_user_id, a.dc_cost_id, b.dc_emp_id, a.c_full_name
                , IIF(c.sp_emp_id is null, 0, IIF( a.dc_user_id = 1 , 2, 1)) as i_set_type_emp
                , isnull(i_type_emp,0) as i_type_emp
                , isnull((select top 1 c_name from NMU_DATACENTER.dbo.dc_cost where dc_cost_id=a.dc_cost_id),'ไม่พบ') as cost_name
                , isnull((select top 1 c_code from NMU_DATACENTER.dbo.dc_cost where dc_cost_id=a.dc_cost_id),'ไม่พบ') as cost_code
                ,(select top 1 dc_area_id from NMU_DATACENTER.dbo.dc_cost where dc_cost_id=a.dc_cost_id) as dc_area_id
                , a.i_type_user
                , a.super_user
                , isnull((select top 1  bb.dc_cost_acc_id from NMU_DATACENTER.dbo.dc_cost bb where bb.dc_cost_id=a.dc_cost_id),0) as dc_cost_acc_id
                , isnull(c.c_name,'') as 'c_sp_emp'
                , isnull(e.c_name,'') as 'c_department_type'
                , 'สายงาน '+d.c_name as 'c_department'
                , CASE
                WHEN c.i_level = 1 THEN 'หัวหน้าหน่วยงาน'
                WHEN c.i_level = 2 THEN 'หัวหน้าสายงาน'
                ELSE 'ผู้ปฎิบัติงาน' END AS 'c_position'
                , isnull(c.dc_emp_id,0) as dc_emp_id
                , isnull(c.sp_emp_id,0) as sp_emp_id
                , isnull(c.dc_department_id,0) as dc_department_id
                , isnull(d.dc_department_type_id,0) as dc_department_type_id
                , isnull(d.i_seq,0) as i_seq
                , isnull(c.i_level,0) as i_level
                , isnull((select top 1 dc_user_id from " . DB_CENTER . "dc_user where dc_emp_id = bb.dc_emp_id),0) as dc_center_user
            from dbo.dc_user a
                left join " . DB_CENTER . "dc_emp bb on bb.c_email = a.c_user_name
                left join dbo.dc_emp b on b.dc_emp_id = a.dc_emp_id
                left join dbo.sp_emp c on c.dc_emp_id = b.dc_emp_id
                left join dbo.sp_department d on d.dc_department_id = c.dc_department_id
                left join dbo.sp_department_type e on e.dc_department_type_id = d.dc_department_type_id
            where a.i_enable = ? and a.i_delete = ? and a.c_user_name = ? and a.c_password = ?";

    $stmt = $db->QueryParam($sql, array(STATUS_ENABLE, DELETE_FALSE, $_POST["userf"], md5($_POST["passwordf"])));
    
    $re = array("reval" => 1, "success" => "Error", "msg" => "Login False");
    while ($data = $db->Fetch($stmt)) {
        session_regenerate_id(true);
    /**/
        $_SESSION["DOMAIN_LOGIN"] = "PROCURE"; //id ผู้ใช้งาน
        $_SESSION["DOMAIN"] = DOMAIN['en']; //id ผู้ใช้งาน 
        $_SESSION["DOMAIN_NAME"] = DOMAIN['th']; //id ผู้ใช้งาน  
        $_SESSION["menu"] = 'sp/dashBard.php'; //id ผู้ใช้งาน   
        $_SESSION["user_id"] = intval($data["dc_user_id"]); //id ผู้ใช้งาน   
        $_SESSION["user_name"] = $data["c_full_name"]; //ชื่อผู้ใช้งาน
        $_SESSION["dc_emp_id"] = intval($data["dc_emp_id"]); //พนักงานผู้รับผิดชอบ 
        $_SESSION["sp_emp_id"] = intval($data["sp_emp_id"]) ?? null; //
        $_SESSION["i_type_emp"] = $data["i_type_emp"]; // i_type_emp
        $_SESSION["dc_department_id"] = intval($data["dc_department_id"]) ?? null; //
        $_SESSION["dc_department_type_id"] = intval($data["dc_department_type_id"]) ?? null; //
        $_SESSION["i_seq"] = intval($data["i_seq"]) ?? null; //
        $_SESSION["i_level"] = intval($data["i_level"]) ?? null; // 
        $_SESSION["dc_center_user"] = intval($data["dc_center_user"]) ?? null; // 
        $_SESSION["c_sp_emp"] = $data["c_sp_emp"] ?? null; //ชื่อพนักงาน
        $_SESSION["c_department_type"] = $data["c_department_type"] ?? null; //
        $_SESSION["c_department"] = $data["c_department"] ?? null; //สายงาน
        $_SESSION["c_position"] = $data["c_position"] ?? null; //ตำแหน่งในสายงาน 
        $_SESSION["dc_cost_id"] = intval($data["dc_cost_id"]); //id หน่วยงาน
        $_SESSION["cost_name"] = $data["cost_name"]; //หน่วยงาน
        $_SESSION["cost_code"] = $data["cost_code"]; //รหัสหน่วยงาน 
        $_SESSION["i_type_user"] = intval($data["i_type_user"]); //ประเภทผู้ใช้งาน
        $_SESSION["super_user"] = intval($data["super_user"]) ?? null;
        $_SESSION["dc_cost_acc_id"] = intval($data["dc_cost_acc_id"]); //id ศูนย์ต้นทุนทางบัญชีของหน่วยงานที่ log in
        $_SESSION["last_login"] = date("Y-m-d H:i:s");

        $re = array("reval" => 0, "success" => "Success", "msg" => "Login Success");
    }
     
}

echo json_encode($re);
exit;
/*
user domain session 
   
 * 
 *    
 *  */
