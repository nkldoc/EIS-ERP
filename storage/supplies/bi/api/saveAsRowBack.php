<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$mode = $_REQUEST["mode"] ?? "LIST";
$c_code = $_REQUEST["c_code"] ?? null;

if ($mode == "LIST") {
    // 1. ปรับ SQL: ใช้ ISNULL ครอบ DATEDIFF เพื่อให้แถวแรกแสดงเลข 0 แทน NULL
    $sql = "SELECT 
                t.tor_id,
                t.c_code,
                s.c_code AS status_code,
                s.c_name AS status_name, 
                convert(varchar, i.d_tor_status_date, 120) AS d_tor_status_date  ,
                i.sp_status_hdr_id,
                ISNULL(DATEDIFF(day, 
                    LAG(i.d_tor_status_date) OVER (PARTITION BY t.tor_id ORDER BY i.d_tor_status_date ASC), 
                    i.d_tor_status_date
                ), 0) AS days_spent
            FROM sp_tor t
            INNER JOIN sp_tor_item i ON t.tor_id = i.tor_id
            INNER JOIN sp_status_hdr s ON i.sp_status_hdr_id = s.sp_status_hdr_id
            WHERE t.c_code = ? 
            ORDER BY i.d_tor_status_date ASC;"; 
    // 2. ใช้ QueryParam เพื่อป้องกัน SQL Injection (ส่ง $c_code เข้าไปใน array)
    $stmt = $db->QueryParam($sql, array($c_code));
    
    $data = array();
    while ($row = $db->Fetch($stmt)) {
        // 3. ปรับ Mapping ข้อมูลให้ตรงกับ Result Set ของ SQL
        $data[] = array(
            "tor_id"            => $row['tor_id'],
            "c_code"            => $row['c_code'],
            "status_code"       => $row['status_code'],
            "status_name"       => $row['status_name'],
            "status_date"       => $date->extDateBuddha($row["d_tor_status_date"]),//$row['d_tor_status_date'],
            "sp_status_hdr_id"  => $row['sp_status_hdr_id'],
            "days_spent"        => intval($row['days_spent']) // จำนวนวันที่ใช้ในขั้นตอนนั้น
        );
    }
    
    echo json_encode(["success" => true, "data" => $data]);

} else if ($mode == "SEARCH_USER") {
    $q = $_REQUEST["q"] ?? "";
    $sql = "SELECT TOP 20 u.dc_user_id, u.c_full_name, u.c_user_name,
            CASE WHEN p.sp_bi_permission_id IS NOT NULL THEN 1 ELSE 0 END as has_permission,
            p.i_enabled
            FROM dbo.dc_user u
            LEFT JOIN " . DB_CENTER . "sp_bi_permission p ON u.dc_user_id = p.dc_user_id
            WHERE (u.c_full_name LIKE ? OR u.c_user_name LIKE ?) 
            AND u.i_enable  = 1 ";

    $term = "%" . $q . "%";
    $stmt = $db->QueryParam($sql, array($term, $term));
    $data = array();
    while ($row = $db->Fetch($stmt)) {
        $data[] = array(
            "id" => $row['dc_user_id'],
            "text" => $row['c_full_name'] . " (" . $row['c_user_name'] . ")",
            "has_permission" => intval($row['has_permission']),
            "enabled" => intval($row['i_enabled'])
        );
    }
    echo json_encode(["results" => $data]);
} else if ($mode == "ADD") {
    $user_id = $_REQUEST["dc_user_id"];
    $c_note = $_REQUEST["c_note"];
    $current_user = $_SESSION["user_id"];

    // Check duplicate
    $sqlCheck = "SELECT COUNT(*) as cnt FROM " . DB_CENTER . "sp_bi_permission WHERE dc_user_id = ?";
    $rowCheck = $db->Fetch($db->QueryParam($sqlCheck, array($user_id)));

    if ($rowCheck['cnt'] > 0) {
        // Assume re-enabling or error? Let's just update enabled to 1
        $upsert = "UPDATE " . DB_CENTER . "sp_bi_permission SET i_enabled = 1, c_note = ?, d_update = GETDATE(), dc_user_update_id = ? WHERE dc_user_id = ?";
        $db->QueryParam($upsert, array($c_note, $current_user, $user_id));
    } else {
        $sql = "INSERT INTO " . DB_CENTER . "sp_bi_permission (dc_user_id, i_enabled, c_note, dc_user_create_id) VALUES (?, 1, ?, ?)";
        $db->QueryParam($sql, array($user_id, $c_note, $current_user));
    }
    echo json_encode(["success" => true]);
} else if ($mode == "UPDATE_STATUS") {
    $current_user = $_SESSION["user_id"];
    $id = $_REQUEST["id"];
    $enabled = $_REQUEST["enabled"]; // 0 or 1

    $sql = "UPDATE " . DB_CENTER . "sp_bi_permission SET i_enabled = ?, d_update = GETDATE(), dc_user_update_id = ? WHERE sp_bi_permission_id = ?";
    $db->QueryParam($sql, array($enabled, $current_user, $id));
    echo json_encode(["success" => true]);
} else if ($mode == "DELETE") {
    $current_user = $_SESSION["user_id"];
    $id = $_REQUEST["id"];
    $sql = "UPDATE " . DB_CENTER . "sp_bi_permission SET i_enabled = 2, d_update = GETDATE(), dc_user_update_id = ? WHERE sp_bi_permission_id = ?";
    $db->QueryParam($sql, array($current_user, $id));
    echo json_encode(["success" => true]);
}
