<?php
// Render the legacy CheckList page at the directory URL.
$checkListBaseHref = "../";
chdir(dirname(__DIR__));
$_SERVER["PHP_SELF"] = "/procure/sp/CheckList.php";
require "CheckList.php";
