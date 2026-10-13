<?php
$file = 'data.json';
$todos = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
header('Content-Type: application/json');
echo json_encode($todos, JSON_UNESCAPED_UNICODE);
