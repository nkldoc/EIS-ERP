<?php
// Use the same Product MSSQL settings as the connection-test page.
require_once __DIR__ . '/../api-eis/procure/conf/database.php';
define('ERPSEND_SOURCE_SERVER_OVERRIDE', MSSQL_DB_SERVER);
require __DIR__ . '/../api-eis/procure/endpoints.php';
