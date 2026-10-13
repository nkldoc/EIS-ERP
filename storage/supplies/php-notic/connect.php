<?php
//connect.php;
        $serverName = "localhost";
	$userName = "root";
	$userPassword = "";
	$dbName = "notif";
	$con = mysqli_connect($serverName,$userName,$userPassword,$dbName);
	mysqli_set_charset($con, "utf8");
 