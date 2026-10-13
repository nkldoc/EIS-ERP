<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");

$db = new DatabaseServer();
$mode = $_REQUEST["mode"] ?? "LIST";

if ($mode == "LIST") {
    $sql = "SELECT a.sp_bi_permission_id, a.dc_user_id, a.i_enabled, a.c_note,
            b.c_full_name, b.c_user_name
            FROM " . DB_CENTER . "sp_bi_permission a
            LEFT JOIN dbo.dc_user b ON a.dc_user_id = b.dc_user_id
            WHERE isnull(a.i_enabled,0) != 2
            ORDER BY a.d_create DESC";

    $stmt = $db->QueryParam($sql, array());
    $data = array();
    while ($row = $db->Fetch($stmt)) {
        $data[] = array(
            "id" => $row['sp_bi_permission_id'],
            "user_id" => $row['dc_user_id'],
            "name" => $row['c_full_name'],
            "username" => $row['c_user_name'],
            "note" => $row['c_note'],
            "enabled" => intval($row['i_enabled'])
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
