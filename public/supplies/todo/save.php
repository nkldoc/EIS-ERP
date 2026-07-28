<?php
$data = file_get_contents("php://input");

if ($data) {
    file_put_contents("todos.json", $data);
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "no data"]);
}
?>
