<?php
/**
 * Extensionless IIS entry point for /supplies/sp/CheckList.
 *
 * CheckList.php and the CheckList asset directory share the same name.
 * After IIS canonicalizes *.php to an extensionless URL, the directory
 * takes precedence. Loading the original page here resolves that collision.
 */
require dirname(__DIR__) . DIRECTORY_SEPARATOR . 'CheckList.php';
