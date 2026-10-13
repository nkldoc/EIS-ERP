<?php
require_once dirname(__FILE__) . '/../../../../conf/config.php';
require_once dirname(__FILE__) . '/../../../../lib/database/DatabaseServer.php';

function receiveValidationDb()
{
    static $db = null;
    if ($db === null) {
        $db = new DatabaseServer();
    }
    return $db;
}

function receiveValidationJson($data, $statusCode = 200)
{
    if (!headers_sent()) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function receiveValidationUserId()
{
    return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
}
