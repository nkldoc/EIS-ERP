<?php
// Run once from CLI: php endpoints-source-migration.php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../classes/Database.php';
$db = (new Database())->dbConnection();
$columns = $db->query('SHOW COLUMNS FROM sp_api_endpoint')->fetchAll(PDO::FETCH_COLUMN);
foreach (['c_database' => 'VARCHAR(128) NULL', 'c_field_map' => 'TEXT NULL'] as $name => $type) {
    if (!in_array($name, $columns, true)) $db->exec("ALTER TABLE sp_api_endpoint ADD COLUMN `$name` $type");
}
echo "Endpoint database and field mapping columns ready.\n";
