<?php
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid data"]);
    exit;
}

// บันทึกลงไฟล์ (หรือปรับให้บันทึกลง database ได้)
file_put_contents("todo_data.json", json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo json_encode(["status" => "success", "message" => "บันทึกแล้ว"]);
