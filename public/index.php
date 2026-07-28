<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$response = [
    'success' => true,
    'application' => 'EIS-ERP',
    'message' => 'EIS-ERP PHP application is running.',
    'time' => gmdate('c'),
];

echo json_encode(
    $response,
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
);
