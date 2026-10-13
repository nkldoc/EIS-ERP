<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;
$act = $_GET['act']??null;
// if($act=='start-chat') 
// exec('c:\WINDOWS\system32\cmd.exe /c START D:\_chat\start-socket.bat');
// else if($act=='stop') 
// exec('c:\WINDOWS\system32\cmd.exe /c START D:\_chat\stop-socket.bat');
// else
// die('No PERMISSION');
