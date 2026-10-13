<?php

include("../../../conf/config.php");

$mode = $_REQUEST["mode"] ?? null; 

$i_type_user = $_SESSION["i_type_user"] ?? null;
$dc_cost_id = $_SESSION["dc_cost_id"] ?? null;
$docDepartmentId = $_SESSION["dc_department_id"] ?? null;
$docDepartment = $_SESSION["c_department"] ?? null;

if (!$docDepartmentId) {
    die(json_encode([]));
}

if ($i_type_user == 2) {
    $mode = "ADMIN_LOG";
} else {
    if ($dc_cost_id == 97) {
        switch ($docDepartmentId) {
            case 6: $mode = "MNDOC_LOG"; break;
            case 3: $mode = "EMP_LOG";   break;
        }
    } else {
        $mode = "COST_LOG";
    }
}

try {
    $host   = 'localhost';
    $dbname = 'notif_eis';
    $username = 'root';
    $password = '';
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "SELECT `id`"
         . ", `bg_year`, `cost_code`, `cost_id`, `cost_name`, `datetime`"
         . ", `dc_cost_id`, `dc_department_id`, `dc_department_type_id`, `domain`"
         . ", `i_level`, `msg`, `msgType`, `sessId`, `sp_emp_id`, `typemsg`"
         . ", `user_id`, `user_name`, `useronline`, `view`, `i_status`"
         . " FROM `logs`"
         . " WHERE i_status = :i_status";

    switch ($mode) {
        case "COST_LOG":
            $sql .= " AND dc_cost_id = :dc_cost_id";
            $sql .= " ORDER BY datetime DESC LIMIT 20";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':i_status', 1, PDO::PARAM_INT);
            $stmt->bindValue(':dc_cost_id', intVal($dc_cost_id), PDO::PARAM_INT);
            break;

        case "MNDOC_LOG":
            $sql .= " AND dc_department_id = :dc_department_id";
            $sql .= " ORDER BY datetime DESC LIMIT 20";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':i_status', 1, PDO::PARAM_INT);
            $stmt->bindValue(':dc_department_id', intVal($docDepartmentId), PDO::PARAM_INT);
            break;

        case "EMP_LOG":
            $sql .= " AND dc_department_id = :dc_department_id";
            $sql .= " ORDER BY datetime DESC LIMIT 20";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':i_status', 1, PDO::PARAM_INT);
            $stmt->bindValue(':dc_department_id', intVal($docDepartmentId), PDO::PARAM_INT);
            break;

        case "ADMIN_LOG":
            $sql .= " ORDER BY datetime DESC LIMIT 20";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':i_status', 1, PDO::PARAM_INT);
            break;

        default:
            echo json_encode([]);
            exit;
    }

    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($result, JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    $stmt = null; // ปิด statement
    $pdo  = null; // ปิด connection
}