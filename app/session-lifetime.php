<?php
// Match the browser cookie expiry to the server's idle deadline.
function eisRenewSessionCookie(int $timeout): void
{
    if (session_status() !== PHP_SESSION_ACTIVE || headers_sent()
        || !ini_get('session.use_cookies') || empty($_SESSION['user_id'])) return;
    $deadline = (int) ($_SESSION['last_activity'] ?? time()) + $timeout;
    if ($deadline <= time()) return;
    $params = session_get_cookie_params();
    setcookie(session_name(), session_id(), [
        'expires' => $deadline, 'path' => $params['path'],
        'domain' => $params['domain'], 'secure' => $params['secure'],
        'httponly' => $params['httponly'], 'samesite' => $params['samesite'] ?? 'Lax',
    ]);
}
