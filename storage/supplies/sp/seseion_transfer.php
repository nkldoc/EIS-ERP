<?PHP
include("../conf/config.php");
include("../lib/database/DatabaseServer.php");
$db        = new DatabaseServer();
$sqlMain = "
    SELECT 
        TOP 1
        a.dc_user_id
        , a.dc_cost_id
        , b.dc_emp_id
        , a.c_full_name
        , ISNULL((SELECT TOP 1 c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id),'ไม่พบ') AS cost_name
        , ISNULL((SELECT TOP 1 c_code FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id),'ไม่พบ') AS cost_code
        ,(SELECT TOP 1 dc_area_id FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id) AS dc_area_id
        , a.i_type_user
        , ISNULL((SELECT TOP 1  bb.dc_cost_acc_id FROM dbo.dc_cost bb WHERE bb.dc_cost_id=a.dc_cost_id),0) AS dc_cost_acc_id
        , ISNULL(c.c_name,'') AS 'c_sp_emp'
        , ISNULL(e.c_name,'') AS 'c_department_type'
        , 'สายงาน '+d.c_name AS 'c_department'
        , CASE
        WHEN c.i_level = 1 THEN 'หัวหน้าหน่วยงาน'
        WHEN c.i_level = 2 THEN 'หัวหน้าสายงาน'
        ELSE 'ผู้ปฎิบัติงาน' END AS 'c_position'
        , ISNULL(c.dc_emp_id,0) AS dc_emp_id
            , ISNULL(c.sp_emp_id,0) AS sp_emp_id
        , ISNULL(c.dc_department_id,0) AS dc_department_id
        , ISNULL(d.dc_department_type_id,0) AS dc_department_type_id
        , ISNULL(d.i_seq,0) AS i_seq
        , ISNULL(c.i_level,0) AS i_level
    FROM dbo.dc_user a
    LEFT JOIN dbo.dc_emp b ON b.dc_emp_id = a.dc_emp_id
    LEFT JOIN dbo.sp_emp c ON c.dc_emp_id = b.dc_emp_id
    LEFT JOIN dbo.sp_department d ON d.dc_department_id = c.dc_department_id
    LEFT JOIN dbo.sp_department_type e ON e.dc_department_type_id = d.dc_department_type_id
    WHERE a.dc_user_id = ?";
$arrParam[] = ($_REQUEST['ss_user_id']??null);

$stmt = $db->QueryParam($sqlMain, $arrParam);
while ($data = $db->Fetch($stmt)) {

    $_SESSION['st']                       = $_REQUEST['ss_st']??null;
    $_SESSION["user_id"]                  = intval($data["dc_user_id"]);
    $_SESSION["user_name"]                = $data["c_full_name"];
    $_SESSION["dc_emp_id"]                = intval($data["dc_emp_id"]);
    $_SESSION["sp_emp_id"]                = intval($data["sp_emp_id"]) ?? null;
    $_SESSION["dc_department_id"]         = intval($data["dc_department_id"]) ?? null;
    $_SESSION["dc_department_type_id"]    = intval($data["dc_department_type_id"]) ?? null;
    $_SESSION["i_seq"]                    = intval($data["i_seq"]) ?? null;
    $_SESSION["i_level"]                  = intval($data["i_level"]) ?? null;

    $_SESSION["c_sp_emp"]                 = $data["c_sp_emp"] ?? null;
    $_SESSION["c_department_type"]        = $data["c_department_type"] ?? null;
    $_SESSION["c_department"]             = $data["c_department"] ?? null;
    $_SESSION["c_position"]               = $data["c_position"] ?? null;

    $_SESSION["dc_cost_id"]               = intval($data["dc_cost_id"]);
    $_SESSION["cost_name"]                = $data["cost_name"];
    $_SESSION["cost_code"]                = $data["cost_code"];
    $_SESSION["dc_area_id"]               = intval($data["dc_area_id"]);
    $_SESSION["i_type_user"]              = intval($data["i_type_user"]);
    $_SESSION["dc_cost_acc_id"]           = intval($data["dc_cost_acc_id"]);
    $_SESSION["last_login"]               = $_REQUEST['ss_last_login']??null;

}

