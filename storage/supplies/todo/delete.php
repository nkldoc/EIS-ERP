<?php
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['index'])) {
    http_response_code(400);
    exit('Invalid index');
}

$file = 'data.json';
$todos = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
if (isset($todos[$data['index']])) {
    array_splice($todos, $data['index'], 1);
    file_put_contents($file, json_encode($todos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo 'Deleted';
} else {
    http_response_code(404);
    echo 'Not found';
}
