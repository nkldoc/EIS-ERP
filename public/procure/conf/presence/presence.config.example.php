<?php
declare(strict_types=1);

// Copy to presence.config.php on this host; that file is not tracked by Git.
// Procure and Supplies share the same private presence storage configuration.
$suppliesConfig = dirname(__DIR__, 3) . '/supplies/conf/presence/presence.config.php';
return is_readable($suppliesConfig) ? (array) require $suppliesConfig : [];
