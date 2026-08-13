<?php
include("../conf/config.php");
include("../lib/database/DatabaseServer.php");
include("../lib/database/apiUtil.php");
include("../lib/date/i_date.class.php");
$db = new DatabaseServer();
echo "TEST";
print_r($_REQUEST);
exit;
$arr = array();
$db->getData($url);
$db->sendAPI($arr, '192.168.110.92/api-mnu/', 'POST');

function po() {
    return null;
}
