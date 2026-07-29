<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers: Content-Type, X-Api-Key ,Origin, X-Requested-With, Accept ,Authorization , X-PINGOTHER,');
header('Access-Control-Allow-Credentials: true');

include("line_Notif.php");
$sl = new line_Notif();
$res = $sl->lineNotif(urldecode($_REQUEST['msg']));
echo json_encode($res);
exit;
