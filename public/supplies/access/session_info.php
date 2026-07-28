<?php
require_once("../conf/config.php");
require_once("../lib/database/apiUtil.php");
$util       = new apiUtil();
echo $util->Text_Encode(json_encode(array("debug" => true, "data" => $_SESSION)));
