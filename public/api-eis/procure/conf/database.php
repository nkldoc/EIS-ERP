<?php
declare(strict_types=1);

// Select defaults from the public route. APP_ENV=production|development can
// be set in IIS to make the environment explicit.
$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
$detectedEnvironment = preg_match('~^/procure(?:/|$)~', $requestPath) ? 'production' : 'development';
$runtimeEnvironment = strtolower((string)(getenv('APP_ENV') ?: $detectedEnvironment));
$isProduction = in_array($runtimeEnvironment, ['production', 'prod'], true);
defined('APP_RUNTIME_ENV') || define('APP_RUNTIME_ENV', $isProduction ? 'production' : 'development');

$envOrDefault = static function (string $name, $default) {
    $value = getenv($name);
    return $value === false ? $default : $value;
};

defined('MYSQL_DB_HOST') || define('MYSQL_DB_HOST', $envOrDefault('MYSQL_DB_HOST', $isProduction ? '192.168.201.24' : 'localhost'));
defined('MYSQL_DB_PORT') || define('MYSQL_DB_PORT', (int)$envOrDefault('MYSQL_DB_PORT', 3306));
defined('MYSQL_DB_NAME') || define('MYSQL_DB_NAME', $envOrDefault('MYSQL_DB_NAME', 'php_auth_api'));
defined('MYSQL_DB_USER') || define('MYSQL_DB_USER', $envOrDefault('MYSQL_DB_USER', $isProduction ? 'admin' : 'root'));
defined('MYSQL_DB_PASS') || define('MYSQL_DB_PASS', $envOrDefault('MYSQL_DB_PASS', $isProduction ? 'adminnkl6644' : ''));

defined('MSSQL_DB_HOST') || define('MSSQL_DB_HOST', $envOrDefault('MSSQL_DB_HOST', $isProduction ? '192.168.201.3' : '.'));
defined('MSSQL_DB_PORT') || define('MSSQL_DB_PORT', (int)$envOrDefault('MSSQL_DB_PORT', 1433));
defined('MSSQL_DB_SERVER') || define(
    'MSSQL_DB_SERVER',
    $envOrDefault('MSSQL_DB_SERVER', $isProduction ? MSSQL_DB_HOST . ',' . MSSQL_DB_PORT : MSSQL_DB_HOST)
);
defined('MSSQL_DB_NAME') || define('MSSQL_DB_NAME', $envOrDefault('MSSQL_DB_NAME', 'NMU_ERP'));
defined('MSSQL_DB_USER') || define('MSSQL_DB_USER', $envOrDefault('MSSQL_DB_USER', 'sa'));
defined('MSSQL_DB_PASS') || define('MSSQL_DB_PASS', $envOrDefault('MSSQL_DB_PASS', 'nklV1'));
defined('MSSQL_TRUST_SERVER_CERTIFICATE') || define(
    'MSSQL_TRUST_SERVER_CERTIFICATE',
    filter_var(getenv('MSSQL_TRUST_SERVER_CERTIFICATE') ?: 'true', FILTER_VALIDATE_BOOLEAN)
);
defined('MSSQL_ENCRYPT') || define(
    'MSSQL_ENCRYPT',
    filter_var(getenv('MSSQL_ENCRYPT') ?: 'false', FILTER_VALIDATE_BOOLEAN)
);

unset($requestPath, $detectedEnvironment, $runtimeEnvironment, $isProduction, $envOrDefault);
