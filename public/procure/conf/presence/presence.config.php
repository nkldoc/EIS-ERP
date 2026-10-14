<?php
declare(strict_types=1);

// Portable between dev and production: Supplies and Procure are sibling apps.
// Reuse the working private storage / WSS settings without copying signing keys.
$suppliesConfig = dirname(__DIR__, 3) . '/supplies/conf/presence/presence.config.php';
return is_readable($suppliesConfig) ? (array) require $suppliesConfig : [];
