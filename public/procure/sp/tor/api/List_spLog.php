<?php

// Database connection details
include("../../../conf/config.php");
$host = 'localhost';
$dbname = 'notif_eis';
$username = 'root';
$password = '';

$pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$mode = $_REQUEST["mode"] ?? null; 

$i_type_user = $_SESSION["i_type_user"] ?? null; //admin 2/1
$dc_cost_id = $_SESSION["dc_cost_id"] ?? null; //admin 2/1 
$docDepartmentId = $_SESSION["dc_department_id"] ?? null;
$docDepartment = $_SESSION["c_department"] ?? null;


if($i_type_user ==2){ //super user
    $mode = "ADMIN_LOG";
}else{ //user
   if($dc_cost_id==97){ //พัสดุ
       switch ($docDepartmentId) {
        case 6: $mode = "MNDOC_LOG";//นักจัด
            break;
        case 3: $mode = "EMP_LOG";//นักจัด
            break;           
       }
    
   }else{ //user cost
       $mode = "COST_LOG";
   }      
}




if (!$docDepartmentId) {
    die("SESSION Expire");
}
    

try {
    // Create a PDO instance List msg
    switch ($mode) {
            case "COST_LOG": //หน่วยงาน
                    // SQL Query
                    $sql = "SELECT `id`"
                            . ", `bg_year`, `cost_code`, `cost_id`, `cost_name`, `datetime`"
                            . ", `dc_cost_id`, `dc_department_id`, `dc_department_type_id`, `domain`"
                            . ", `i_level`, `msg`, `msgType`, `sessId`, `sp_emp_id`, `typemsg`"
                            . ", `user_id`, `user_name`, `useronline`, `view`, `i_status` "
                            . " FROM `logs` "
                            . " WHERE msgType=:msgType and i_status=:i_status"
                            . " order by datetime desc  LIMIT 20";

                    $stmt = $pdo->prepare($sql);
                    $stmt->bindParam(':msgType', intVal($msgType), PDO::PARAM_INT);
                    $stmt->bindParam(':i_status', intVal(1), PDO::PARAM_INT);
                    // $stmt->bindParam(':msgType', $msgType, PDO::PARAM_STR); 
                    $stmt->execute();
                    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    break;
            case "MNDOC_LOG":  //นักจัด
                    // SQL Query
                    $sql = "SELECT `id`"
                            . ", `bg_year`, `cost_code`, `cost_id`, `cost_name`, `datetime`"
                            . ", `dc_cost_id`, `dc_department_id`, `dc_department_type_id`, `domain`"
                            . ", `i_level`, `msg`, `msgType`, `sessId`, `sp_emp_id`, `typemsg`"
                            . ", `user_id`, `user_name`, `useronline`, `view`, `i_status` "
                            . " FROM `logs` "
                            . " WHERE msgType=:msgType and i_status=:i_status"
                            . " order by datetime desc  LIMIT 20";

                    $stmt = $pdo->prepare($sql);
                    $stmt->bindParam(':msgType', intVal($msgType), PDO::PARAM_INT);
                    $stmt->bindParam(':i_status', intVal(1), PDO::PARAM_INT);
                    // $stmt->bindParam(':msgType', $msgType, PDO::PARAM_STR); 
                    $stmt->execute();
                    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    break;
            case "HPRO_LOG": //หัวหน้าซื้อจ้าง
                    // SQL Query
                    $sql = "SELECT `id`"
                            . ", `bg_year`, `cost_code`, `cost_id`, `cost_name`, `datetime`"
                            . ", `dc_cost_id`, `dc_department_id`, `dc_department_type_id`, `domain`"
                            . ", `i_level`, `msg`, `msgType`, `sessId`, `sp_emp_id`, `typemsg`"
                            . ", `user_id`, `user_name`, `useronline`, `view`, `i_status` "
                            . " FROM `logs` "
                            . " WHERE msgType=:msgType and i_status=:i_status"
                            . " order by datetime desc  LIMIT 20";

                    $stmt = $pdo->prepare($sql);
                    $stmt->bindParam(':msgType', intVal($msgType), PDO::PARAM_INT);
                    $stmt->bindParam(':i_status', intVal(1), PDO::PARAM_INT);
                    // $stmt->bindParam(':msgType', $msgType, PDO::PARAM_STR); 
                    $stmt->execute();
                    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    break;
            case "HDEP_LOG": //หัวหน้าสายงาน
                    // SQL Query
                    $sql = "SELECT `id`"
                            . ", `bg_year`, `cost_code`, `cost_id`, `cost_name`, `datetime`"
                            . ", `dc_cost_id`, `dc_department_id`, `dc_department_type_id`, `domain`"
                            . ", `i_level`, `msg`, `msgType`, `sessId`, `sp_emp_id`, `typemsg`"
                            . ", `user_id`, `user_name`, `useronline`, `view`, `i_status` "
                            . " FROM `logs` "
                            . " WHERE msgType=:msgType and i_status=:i_status"
                            . " order by datetime desc  LIMIT 20";

                    $stmt = $pdo->prepare($sql);
                    $stmt->bindParam(':msgType', intVal($msgType), PDO::PARAM_INT);
                    $stmt->bindParam(':i_status', intVal(1), PDO::PARAM_INT);
                    // $stmt->bindParam(':msgType', $msgType, PDO::PARAM_STR); 
                    $stmt->execute();
                    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            break;
            case "EMP_LOG": //สายงาน
                    // SQL Query
                    $sql = "SELECT `id`"
                            . ", `bg_year`, `cost_code`, `cost_id`, `cost_name`, `datetime`"
                            . ", `dc_cost_id`, `dc_department_id`, `dc_department_type_id`, `domain`"
                            . ", `i_level`, `msg`, `msgType`, `sessId`, `sp_emp_id`, `typemsg`"
                            . ", `user_id`, `user_name`, `useronline`, `view`, `i_status` "
                            . " FROM `logs` "
                            . " WHERE msgType=:msgType and i_status=:i_status"
                            . " order by datetime desc  LIMIT 20";

                    $stmt = $pdo->prepare($sql);
                    $stmt->bindParam(':msgType', intVal($msgType), PDO::PARAM_INT);
                    $stmt->bindParam(':i_status', intVal(1), PDO::PARAM_INT);
                    // $stmt->bindParam(':msgType', $msgType, PDO::PARAM_STR); 
                    $stmt->execute();
                    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            break;
            case "ADMIN_LOG": //แอดมิน
                    // SQL Query
                    $sql = "SELECT `id`"
                            . ", `bg_year`, `cost_code`, `cost_id`, `cost_name`, `datetime`"
                            . ", `dc_cost_id`, `dc_department_id`, `dc_department_type_id`, `domain`"
                            . ", `i_level`, `msg`, `msgType`, `sessId`, `sp_emp_id`, `typemsg`"
                            . ", `user_id`, `user_name`, `useronline`, `view`, `i_status` "
                            . " FROM `logs` "
                            . " WHERE msgType=:msgType and i_status=:i_status"
                            . " order by datetime desc  LIMIT 20";

                    $stmt = $pdo->prepare($sql);
                    $stmt->bindParam(':msgType', intVal($msgType), PDO::PARAM_INT);
                    $stmt->bindParam(':i_status', intVal(1), PDO::PARAM_INT);  //ดูแล้ว
                    // $stmt->bindParam(':msgType', $msgType, PDO::PARAM_STR); 
                    $stmt->execute();
                    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            break; 
            default: die('*-*'); break;
    } 
    $json = json_encode($result, JSON_PRETTY_PRINT); //    $json = json_encode($result); 
    echo $json;
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage();
}
    
